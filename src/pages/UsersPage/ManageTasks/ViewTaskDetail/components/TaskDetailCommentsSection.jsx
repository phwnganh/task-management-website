import { useState, useEffect, useCallback } from "react";
import { Input, Button, Avatar, Modal, Pagination, Tooltip, notification } from "antd"; // Changed 'message' to 'notification'
import { SendOutlined, DeleteOutlined, StarOutlined } from "@ant-design/icons";
import {
  apiCreateComment,
  apiGetCommentsByTask,
  apiGetAllUsers,
  apiDeleteComments, // Using plural for batch delete
  apiGetTaskDetail,
  validateCommentWithGeminiGeneration,
} from "../../../../../services/UserService/ManageTasksService";
import { apiGetProjectOwner } from "../../../../../services/UserService/ManageMembersInsideProjectService";

const COMMENTS_PER_PAGE = 5;

const TaskDetailCommentsSection = ({ taskId, userId, projectId }) => {
  const [comments, setComments] = useState([]); // Comments for display (max 30)
  const [allCommentsData, setAllCommentsData] = useState([]); // NEW STATE: All comments from API
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0); // True total count of ACTIVE comments
  const [ownerId, setOwnerId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);

  // Helper function to get all descendant comment IDs
  // Now takes the full flat list of ALL comments
  const getCommentDescendantIds = (commentId, allCommentsFlat) => {
    let descendantIds = [];
    const directReplies = allCommentsFlat.filter(
      (c) => c.parent_id === commentId
    );

    for (const reply of directReplies) {
      descendantIds.push(reply.id);
      descendantIds = descendantIds.concat(
        getCommentDescendantIds(reply.id, allCommentsFlat)
      );
    }
    return descendantIds;
  };

  // Extract fetchData to be a reusable function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedComments, fetchedUsers] = await Promise.all([
        apiGetCommentsByTask(taskId), // This now fetches ALL comments (active + any previously soft-deleted)
        apiGetAllUsers(),
      ]);

      setAllCommentsData(fetchedComments); // Store ALL comments here for descendant calculation

      // Removed filter for 'deleted_at' as it's no longer in the schema.
      // All fetchedComments are now considered active for display.
      setTotalComments(fetchedComments.length); 

      // Sort comments by creation date in descending order and slice to get latest 30 for display
      const latest30CommentsForDisplay = fetchedComments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 31);

      setComments(latest30CommentsForDisplay); // Comments for current display
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching comments or users:", error);
      notification.error({ // Changed from message.error
        message: "Failed to load comments or users.", // Mapped 'content' to 'message'
      });
    } finally {
      setLoading(false);
    }
  }, [taskId]); // Depend on taskId as it's used inside fetchData

  // Call fetchData on component mount and when taskId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Depend on fetchData (from useCallback)

  // Fetch task details for validation using apiGetTaskDetail
  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      try {
        const task = await apiGetTaskDetail(taskId);
        setTaskDetails(task);
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        notification.error({ // Changed from message.error
          message: "Failed to load task details for comment validation.", // Mapped 'content' to 'message'
        });
        setTaskDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskData();
    }
  }, [taskId]);

  // Fetch project owner
  useEffect(() => {
    const fetchOwner = async () => {
      if (projectId) {
        try {
          const owner = await apiGetProjectOwner(projectId);
          setOwnerId(owner.id);
        } catch (error) {
          console.error("Error fetching project owner:", error);
        }
      }
    };
    fetchOwner();
  }, [projectId]);

  const buildCommentTree = (comments, parentId = null) => {
    return comments
      .filter((comment) => comment.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((comment) => ({
        ...comment,
        replies: buildCommentTree(comments, comment.id),
      }));
  };

  const commentTree = buildCommentTree(comments); // This will reflect the latest 30 comments for display and pagination

  const handleDeleteComment = async (commentToDelete) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this comment and all its replies?",
      onOk: async () => {
        try {
          setLoading(true);

          // Get all IDs to delete: the parent comment ID plus all its descendants
          let descendantIds = getCommentDescendantIds(commentToDelete.id, allCommentsData);
          const idsToDelete = [...descendantIds.reverse(), commentToDelete.id]; // Delete replies first, then parent

          // Call the API function to delete multiple comments
          await apiDeleteComments(idsToDelete, userId);

          // After deletion, re-fetch all data to ensure consistency
          await fetchData();

          notification.success({ // Changed from message.success
            message: "The comment and its replies have been successfully deleted.", // Mapped 'content' to 'message'
          });
        } catch (error) {
          console.error("Error deleting comment(s):", error);
          notification.error({ // Changed from message.error
            message: `Failed to delete comment(s).`, // Mapped 'content' to 'message'
            description: `You might not have permission or an error occurred: ${error.message}`, // Added description
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReplyClick = (comment) => {
    setReplyingTo(comment.id);
    setNewComment(`@${getUserName(comment.user_id)} `);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      notification.warning({ // Changed from message.warning
        message: "Empty Comment", // Mapped 'title' to 'message'
        description: "Please enter a comment before posting.", // Mapped 'content' to 'description'
      });
      return;
    }

    // Check if comment limit is reached (now based on active comments)
    if (totalComments >= 30) {
      notification.info({ // Changed from message.info
        message: "Comment Limit Reached", // Mapped 'title' to 'message'
        description: "This task has reached its comment limit (30 active comments). For further discussions, please contact the project owner to create a new task.", // Mapped 'content' to 'description'
      });
      return;
    }

    if (!taskDetails || !taskDetails.title || !taskDetails.description) {
      notification.error({ // Changed from message.error
        message: "Task Details Missing", // Mapped 'title' to 'message'
        description: "Cannot validate comment: Task title or description is missing. Please try again later.", // Mapped 'content' to 'description'
      });
      return;
    }

    setLoading(true);
    const validationResult = await validateCommentWithGeminiGeneration(
      taskDetails.title,
      taskDetails.description,
      newComment
    );

    console.log("Gemini Validation Result:", validationResult);

    if (!validationResult.isValid) {
      setLoading(false);
      notification.warning({ // Changed from message.warning
        message: "Comment Not Relevant", // Mapped 'title' to 'message'
        description: `Your comment appears to be off-topic. Reason: ${validationResult.reason}. Please refine your comment to be more relevant to the task.`, // Mapped 'content' to 'description'
      });
      return;
    }

    try {
      const createdComment = await apiCreateComment(
        taskId,
        newComment,
        userId,
        replyingTo
      );

      // After creation, re-fetch all data to ensure consistency
      await fetchData();

      setNewComment("");
      setReplyingTo(null);
      notification.success({ // Changed from message.success
        message: "Comment Posted", // Mapped 'title' to 'message'
        description: "Your comment has been successfully posted.", // Mapped 'content' to 'description'
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      notification.error({ // Changed from message.error
        message: "Error Posting Comment", // Mapped 'title' to 'message'
        description: "Failed to post comment. Please try again.", // Mapped 'content' to 'description'
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  const getUserAvatar = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.avatar_url : "https://via.placeholder.com/40";
  };

  const renderCommentNode = (comment) => (
    <div key={comment.id} className="flex items-start space-x-4 mb-6">
      <Avatar size="large" src={getUserAvatar(comment.user_id)} className="flex-shrink-0" />
      <div className="flex-grow bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out">
        <div className="font-semibold flex items-center text-base text-gray-800">
          {getUserName(comment.user_id)}
          {comment.user_id === ownerId && (
            <Tooltip title="Project Owner">
              <StarOutlined
                className="ml-2 text-yellow-500 text-lg"
                style={{ color: '#FFD700', display: 'inline-block' }}
              />
            </Tooltip>
          )}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          {new Date(comment.created_at).toLocaleString()}
        </div>
        <p className="mt-2 text-gray-800 leading-relaxed text-sm">
          {comment.taskComments || comment.content}
        </p>
        <div className="flex items-center space-x-3 mt-3">
          <Button type="link" onClick={() => handleReplyClick(comment)} size="small" className="text-blue-500 hover:text-blue-700">
            Reply
          </Button>
          {(comment.user_id === userId || userId === ownerId) && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteComment(comment)}
              size="small"
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 border-l-2 border-blue-200 pl-4 pt-2">
            {comment.replies.map((reply) => renderCommentNode(reply))}
          </div>
        )}
      </div>
    </div>
  );

  const paginatedComments = commentTree.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6 border-b pb-4 border-gray-200">
        <h3 className="text-3xl font-bold text-gray-800">Comments for This Task</h3>
      </div>
      {loading && !taskDetails ? (
        <div className="text-center py-8 text-gray-600">Loading comments and task details...</div>
      ) : (
        <>
          <div className="space-y-6">
            {commentTree.length === 0 && (
              <div className="text-gray-500 text-center py-4">No comments found for this task. Be the first to comment!</div>
            )}
            {paginatedComments.map((comment) => renderCommentNode(comment))}
          </div>

          {commentTree.length > COMMENTS_PER_PAGE && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={COMMENTS_PER_PAGE}
                total={commentTree.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-200">
            <h4 className="text-xl font-semibold mb-4 text-gray-700">Add a Comment</h4>
            <div className="flex items-start space-x-3">
              <Avatar size="large" src={getUserAvatar(userId)} className="flex-shrink-0" />
              <Input.TextArea
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo
                    ? `Replying to ${getUserName(
                        comments.find((c) => c.id === replyingTo)?.user_id
                      )}...`
                    : "Write a comment..."
                }
                className="flex-grow rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={!taskDetails}
              />
            </div>
            <div className="flex justify-end mt-4 space-x-3">
              {replyingTo && (
                <Button onClick={() => setReplyingTo(null)} className="flex-shrink-0">
                  Cancel Reply
                </Button>
              )}
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmitComment}
                loading={loading}
                className="flex-shrink-0"
                disabled={!taskDetails || loading || !newComment.trim()}
              >
                {loading && newComment.trim() ? "Validating..." : "Post "}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetailCommentsSection;