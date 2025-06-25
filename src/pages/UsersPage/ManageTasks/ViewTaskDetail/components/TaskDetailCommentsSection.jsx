import { useState, useEffect, useCallback } from "react";
import {
  Input,
  Button,
  Avatar,
  Modal,
  Pagination,
  Tooltip,
  notification,
} from "antd";
import { SendOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { TbStarFilled } from "react-icons/tb";
import {
  apiCreateComment,
  apiGetCommentsByTask,
  apiGetAllUsers,
  apiDeleteCommentByParentID,
  apiGetTaskDetail,
  apiEditComment,
  apiGetCommentReactions,
  apiReactToComment,
  apiDeleteSingleComment,
} from "../../../../../services/UserService/ManageTasksService";
import { apiGetProjectOwner } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import { validateCommentWithAI } from "../../../../../services/UserService/AIService";
import { useAuth } from "../../../../../context/useAuth";
import { ADMIN } from "../../../../../constants/role.constants";
import { useTranslation } from "react-i18next";

const COMMENTS_PER_PAGE = 5;

const TaskDetailCommentsSection = ({ taskId, projectId }) => {
  const { t } = useTranslation("cmtAtt");
  const { user } = useAuth();
  const userId = user.id;
  const [comments, setComments] = useState([]);

  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ownerId, setOwnerId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [commentReactions, setCommentReactions] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedComments, fetchedUsers] = await Promise.all([
        apiGetCommentsByTask(taskId),
        apiGetAllUsers(),
      ]);

      const latest30 = fetchedComments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 31);
      setComments(latest30);
      setUsers(fetchedUsers);

      const reactionsData = await Promise.all(
        fetchedComments.map((c) =>
          apiGetCommentReactions(c.id).then((r) => ({
            commentId: c.id,
            reactions: r,
          }))
        )
      );
      const reactionMap = {};
      reactionsData.forEach(({ commentId, reactions }) => {
        reactionMap[commentId] = reactions;
      });
      setCommentReactions(reactionMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({
        message: "Failed to load data",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const task = await apiGetTaskDetail(taskId);
        setTaskDetails(task);
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        setTaskDetails(null);
      }
    };
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const owner = await apiGetProjectOwner(projectId);
        setOwnerId(owner.id);
      } catch {}
    };
    fetchOwner();
  }, [projectId]);

  const buildCommentTree = (list, parentId = null) =>
    list
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((c) => ({ ...c, replies: buildCommentTree(list, c.id) }));

  const commentTree = buildCommentTree(comments);

  const handleReplyClick = (comment) => {
    setReplyingTo(comment.id);
    setNewComment(
      `@${comment.user_id === userId ? "Me" : getUserName(comment.user_id)} `
    );
  };

  const extractCommentContent = (content) => {
    return content.replace(/@(\w+\s\w+)/g, "").trim();
  };

  const handleSubmitComment = async () => {
    const content = extractCommentContent(newComment);
    if (!content)
      return notification.warning({
        message: "Empty Comment",
        placement: "bottomRight",
      });

    const topLevelCommentsCount = comments.filter(
      (c) => c.parent_id === null
    ).length;

    if (topLevelCommentsCount >= 30 && !replyingTo) {
      return notification.info({
        message: "Top-level comment limit reached",
        description: t(
          "The limit of 30 top-level comments has been reached. You can still reply to existing comments"
        ),
        placement: "bottomRight",
      });
    }

    if (!taskDetails) return;

    setIsVerifying(true);
    try {
      const validation = await validateCommentWithAI(
        taskDetails.title,
        taskDetails.description || "",
        content
      );
      if (!validation?.isValid) {
        notification.error({
          message: validation?.feedback || "Comment not valid",
          placement: "bottomRight",
        });
        setIsVerifying(false);
        return;
      }
    } catch {
      notification.error({
        message: "AI Validation Failed",
        placement: "bottomRight",
      });
      setIsVerifying(false);
      return;
    }

    setIsVerifying(false);
    setLoading(true);
    try {
      await apiCreateComment(taskId, content, userId, replyingTo);
      await fetchData();
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Error posting comment",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    if (comment.user_id !== userId && user.role !== ADMIN)
      return notification.error({
        message: "Not authorized",
        placement: "bottomRight",
      });

    const isParentComment = comment.comment_type === "comment";
    const modalContent = isParentComment
      ? t(
          "This will delete the comment and all its replies. This action cannot be undone."
        )
      : t("This will delete the reply. This action cannot be undone.");

    Modal.confirm({
      title: t("Delete comment"),
      content: modalContent,
      onOk: async () => {
        try {
          setLoading(true);
          let result;
          if (isParentComment) {
            result = await apiDeleteCommentByParentID(comment.id, userId);
          } else {
            result = await apiDeleteSingleComment(comment.id, userId);
          }
          if (result.success) {
            await fetchData();
            notification.success({
              message: "Comment deleted successfully",
              placement: "bottomRight",
            });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          notification.error({
            message: "Delete failed",
            description: err.message,
            placement: "bottomRight",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEditComment = async (commentId) => {
    const content = extractCommentContent(editedCommentContent);
    setIsVerifying(true);
    try {
      const validation = await validateCommentWithAI(
        taskDetails.title,
        taskDetails.description || "",
        content
      );
      if (!validation?.isValid) {
        notification.error({
          message: validation?.feedback || "Comment not valid",
          placement: "bottomRight",
        });
        setIsVerifying(false);
        return;
      }
    } catch {
      notification.error({
        message: "AI validation failed",
        placement: "bottomRight",
      });
      setIsVerifying(false);
      return;
    }

    setIsVerifying(false);
    setLoading(true);
    try {
      await apiEditComment(commentId, editedCommentContent, userId);
      await fetchData();
      setEditingCommentId(null);
    } catch (err) {
      notification.error({ message: "Edit failed", placement: "bottomRight" });
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (commentId, emoji) => {
    try {
      const result = await apiReactToComment(commentId, userId, emoji);
      if (result.success) {
        const updated = await apiGetCommentReactions(commentId);
        setCommentReactions((prev) => ({ ...prev, [commentId]: updated }));
        if (result.action === "created") {
          notification.success({
            message: "Reaction added",
            placement: "bottomRight",
          });
        } else if (result.action === "deleted") {
          notification.success({
            message: "Reaction removed",
            placement: "bottomRight",
          });
        }
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      notification.error({
        message: "Reaction failed",
        description: err.message,
        placement: "bottomRight",
      });
    }
  };

  const getUserName = (id) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.first_name} ${u.last_name}` : "Unknown";
  };

  const getUserAvatar = (id) => {
    const u = users.find((u) => u.id === id);
    return u?.avatar_url;
  };

  const renderReactions = (commentId) => {
    const reactions = commentReactions[commentId] || [];
    const emojis = ["👍", "❤️", "😂", "😮", "😢"];

    return (
      <div className="flex items-center space-x-2">
        {emojis.map((emoji) => {
          const count = reactions.filter(
            (r) => r.reaction_type === emoji
          ).length;
          const reacted = reactions.find(
            (r) => r.reaction_type === emoji && r.user_id === userId
          );
          return (
            <Tooltip key={emoji} title={emoji}>
              <Button
                size="small"
                type={reacted ? "primary" : "default"}
                onClick={() => handleReaction(commentId, emoji)}
              >
                {emoji} {count > 0 && count}
              </Button>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const renderCommentNode = (comment) => (
    <div key={comment.id}>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Avatar size="large" src={getUserAvatar(comment.user_id)} />
          <div className="ml-4">
            <div className="flex items-center font-semibold text-gray-800">
              <span>
                {comment.user_id === userId
                  ? "Me"
                  : getUserName(comment.user_id)}
              </span>
              {comment.user_id === ownerId && (
                <Tooltip title={t("Project Owner")}>
                  <TbStarFilled style={{ color: "#FFC700" }} className="ml-2" />
                </Tooltip>
              )}
            </div>
          </div>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleString()}
            {comment.updated_at &&
              new Date(comment.updated_at).getTime() !==
                new Date(comment.created_at).getTime() && (
                <span className="ml-2 italic">
                  ({t("Edited on")}{" "}
                  {new Date(comment.updated_at).toLocaleString()})
                </span>
              )}
          </span>
        </div>

        {/* Card Body: The comment content */}
        <div className="text-gray-700">
          {editingCommentId === comment.id ? (
            <Input.TextArea
              value={editedCommentContent}
              onChange={(e) => setEditedCommentContent(e.target.value)}
              autoSize
            />
          ) : (
            <p>
              {(() => {
                const parentComment = comment.parent_id
                  ? comments.find((c) => c.id === comment.parent_id)
                  : null;

                if (parentComment) {
                  const parentAuthorName = getUserName(parentComment.user_id);
                  return (
                    <>
                      <strong className="mr-1 text-blue-600">
                        @{parentAuthorName}
                      </strong>
                      {comment.content}
                    </>
                  );
                }
                return comment.content;
              })()}
            </p>
          )}
        </div>

        {/* Card Footer: Reactions and Action Buttons */}
        <div className="mt-4 flex items-center justify-between">
          {renderReactions(comment.id)}

          <div className="flex items-center space-x-2">
            {editingCommentId === comment.id ? (
              <>
                <Button size="small" onClick={() => setEditingCommentId(null)}>
                  {t("Cancel")}
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleEditComment(comment.id)}
                  loading={loading}
                  disabled={!editedCommentContent.trim()}
                >
                  {t("Save")}
                </Button>
              </>
            ) : (
              <Button
                type="link"
                onClick={() => handleReplyClick(comment)}
                size="small"
              >
                {t("Reply")}
              </Button>
            )}

            {/* The Edit and Delete icons are only shown when NOT editing */}
            {(comment.user_id === userId || user.role === ADMIN) &&
              editingCommentId !== comment.id && (
                <>
                  <Tooltip title={t("Edit comment")}>
                    <Button
                      type="text"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditedCommentContent(comment.content);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t("Delete comment")}>
                    <Button
                      type="text"
                      shape="circle"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteComment(comment)}
                    />
                  </Tooltip>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Container for replies, providing indentation */}
      {comment.replies?.length > 0 && (
        <div className="mt-4 pl-8 border-l-2 border-gray-200 space-y-4">
          {comment.replies.map(renderCommentNode)}
        </div>
      )}
    </div>
  );

  const paginated = commentTree.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  // Main component render
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-100 font-sans rounded-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Comments")}</h3>

      {loading && comments.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {t("Loading comments...")}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {commentTree.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                {t("No comments yet. Be the first to start the conversation!")}
              </div>
            ) : (
              paginated.map(renderCommentNode)
            )}
          </div>

          {commentTree.length > COMMENTS_PER_PAGE && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={COMMENTS_PER_PAGE}
                total={commentTree.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          )}

          <div className="mt-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {replyingTo ? t("Add a Reply") : t("Add a Comment")}
              </h4>

              <div className="flex items-start space-x-4">
                <Avatar size="large" src={getUserAvatar(userId)} />
                <div className="flex-grow">
                  <Input.TextArea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      replyingTo
                        ? `${t("Replying to")} ${getUserName(replyingTo)}...`
                        : t("Enter a comment related to this task...")
                    }
                    disabled={!taskDetails}
                  />
                  <div className="flex justify-end items-center mt-4 space-x-3">
                    {replyingTo && (
                      <Button onClick={() => setReplyingTo(null)}>
                        {t("Cancel Reply")}
                      </Button>
                    )}
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmitComment}
                      loading={loading || isVerifying}
                      disabled={
                        !taskDetails ||
                        loading ||
                        isVerifying ||
                        !newComment.trim()
                      }
                    >
                      {isVerifying ? t("Verifying...") : t("Post")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetailCommentsSection;
