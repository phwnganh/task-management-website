import { API } from "../../constants/api.constants";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { apiCreateNotifications } from "./NotificationsService";
import {
  TASK_COMMENT,
  TASK_COMMENT_REACTION,
  TASK_REPLY,
} from "../../constants/notifications.constants";
import { apiGetProjectDetail } from "./ManageProjectsService";
import { apiGetUserDetail } from "../AdminService/ManageUsersService";

export const apiGetTaskList = async () => {
  try {
    const res = await fetch(`${API.TASK_URI}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch task list!`);
    }
    const tasks = await res.json();
    console.log("tasks in api service: ", tasks);

    return tasks && Array.isArray(tasks)
      ? tasks
      : Array.isArray(tasks)
      ? tasks
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetTaskListByProject = async (projectId) => {
  try {
    const res = await fetch(`${API.TASK_URI}?project_id=${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch task list!`);
    }
    const tasks = await res.json();
    console.log("tasks by project in api service: ", tasks);

    return tasks && Array.isArray(tasks)
      ? tasks
      : Array.isArray(tasks)
      ? tasks
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetTaskListByAssignee = async (assigneeId, projectId) => {
  try {
    const memberRes = await fetch(
      `${API.PROJECT_MEMBER_URI}?user_id=${assigneeId}&project_id=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!memberRes.ok) {
      throw new Error("Failed to fetch project member.");
    }
    const projectMembers = await memberRes.json();
    const isMember = projectMembers.some(
      (member) =>
        member.role === "Member" && member.invite_status === "Accepted"
    );
    if (!isMember) {
      return [];
    }
    const res = await fetch(`${API.TASK_URI}?project_id=${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch task list for assignee!`);
    }
    const tasks = await res.json();
    console.log("tasks by assignee in api service: ", tasks);

    const filteredTasks = Array.isArray(tasks)
      ? tasks.filter(
          (task) =>
            task.assignee_ids.includes(assigneeId) && task.is_deleted === false
        )
      : [];

    return filteredTasks;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiUpdateTaskStatus = async (taskId, newStatus) => {
  // Nếu là completed thì thêm completed_at
  const updateBody = {
    status: newStatus,
  };

  if (newStatus === "Completed") {
    updateBody.completed_at = new Date().toISOString();
  } else {
    // Nếu chuyển về trạng thái khác thì xoá completed_at (optional)
    updateBody.completed_at = null;
  }

  const res = await fetch(`${API.TASK_URI}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateBody),
  });

  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const apiCreateTask = async (taskData) => {
  try {
    const res = await fetch(`${API.TASK_URI}`, {
      method: "POST",
      body: JSON.stringify(taskData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to create task!`);
    }
    return await res.json();
  } catch (error) {
    throw new Error(error);
  }
};

export const apiRequestToUpdateTaskByMember = async ({
  task_id,
  requester_id,
  proposed_changes,
}) => {
  try {
    const payload = {
      id: uuidv4(), // id tự tăng (uuid)
      task_id,
      requester_id,
      proposed_changes,
      status: "Pending",
      created_at: new Date().toISOString(),
    };

    const res = await fetch(`${API.REQUEST_TO_EDIT_TASK_URI}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to request to update task!");
    }

    const response = await res.json();
    return { request_id: payload.id, ...response };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiUpdateTaskByOwner = async (id, updates) => {
  try {
    if (!id) throw new Error("Task ID không được để trống!");
    const payload = {
      ...updates,
      start_date: updates.start_date
        ? dayjs(updates.start_date).toISOString()
        : undefined,
      due_date: updates.due_date
        ? dayjs(updates.due_date).toISOString()
        : undefined,
      updated_at: dayjs().toISOString(),
    };

    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    const res = await fetch(`${API.TASK_URI}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to update task!");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Unknown error");
  }
};

export const apiGetRequestToEditTaskByMember = async (taskId) => {
  try {
    const res = await fetch(
      `${API.REQUEST_TO_EDIT_TASK_URI}?task_id=${taskId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to get content!`);
    }
    const contents = await res.json();
    console.log("requested content: ", contents);

    return contents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiChangeRequestContentStatus = async (requestId, newStatus) => {
  try {
    const res = await fetch(`${API.REQUEST_TO_EDIT_TASK_URI}/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to update status!");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetRequestToEditTaskDetail = async (id) => {
  try {
    const res = await fetch(`${API.REQUEST_TO_EDIT_TASK_URI}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to get content!`);
    }
    const contents = await res.json();
    console.log("requested content detail: ", contents);

    return contents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiDisplayAssigneeByTask = async (projectId) => {
  try {
    const res = await fetch(
      `${API.TASK_URI}?project_id=${projectId}&_embed=assignees`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks with assignees!`);
    }
    const tasks = await res.json();
    console.log("tasks with assignees in api service: ", tasks);
    return tasks && Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetTaskDetail = async (taskId) => {
  try {
    const res = await fetch(`${API.TASK_URI}/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      // Correcting the error message to be more general if assignees are not always embedded
      throw new Error(`Failed to fetch task detail!`);
    }
    const tasks = await res.json(); // This will be a single task object
    console.log("task detail in api service: ", tasks);
    return tasks;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service này PATCH task dựa trên id (ví dụ với json-server hoặc REST API thường)
export const apiUpdateTaskTitleDesc1 = async ({
  task_id,
  title,
  description,
}) => {
  try {
    const res = await fetch(`${API.TASK_URI}/${task_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      throw new Error("Failed to update task!");
    }
    return res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiUpdateTaskTitleDesc = async ({
  task_id,
  title,
  description,
}) => {
  try {
    const res = await fetch(`${API.TASK_URI}/${task_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update task!");
    }
    return data;
  } catch (error) {
    console.error("Update task error:", error);
    throw new Error(error.message);
  }
};

export const apiRenderTaskAttachments = async (taskId) => {
  try {
    const res = await fetch(`${API.TASK_ATTACHMENT}?task_id=${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch task attachments");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiUploadAttachment = async (file, payload) => {
  try {
    const res = await fetch(`${API.TASK_ATTACHMENT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to upload attachment");
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiRemoveAttachmentFromTask = async (attachmentId, userId) => {
  try {
    const res = await fetch(`${API.TASK_ATTACHMENT}/${attachmentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to remove attachment");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetAssigneeTasksInParticipatedProjects = async (assigneeId) => {
  try {
    // Fetch projects where user is Member or Owner with invite_status=Accepted
    const memberRes = await fetch(
      `${API.PROJECT_MEMBER_URI}?user_id=${assigneeId}&invite_status=Accepted`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!memberRes.ok) {
      throw new Error("Failed to fetch project members");
    }
    const projectMembers = await memberRes.json();
    const projectIds = projectMembers
      .filter((member) => ["Member", "Owner"].includes(member.role))
      .map((member) => member.project_id);

    if (projectIds.length === 0) {
      return [];
    }

    // Fetch tasks for each project, handling failures individually
    const tasksPromises = projectIds.map(async (projectId) => {
      try {
        const res = await fetch(`${API.TASK_URI}?project_id=${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch tasks for project ${projectId}`);
        }
        const tasks = await res.json();
        return tasks.filter(
          (task) =>
            task.assignee_ids.includes(assigneeId) && task.is_deleted === false
        );
      } catch (error) {
        console.warn(
          `Error fetching tasks for project ${projectId}:`,
          error.message
        );
        return [];
      }
    });

    const tasksResults = await Promise.all(tasksPromises);
    const tasks = tasksResults.flat();

    // Fetch projects using _id_in query
    const projectsRes = await fetch(
      `${API.PROJECT_URI}?_id_in=${projectIds.join(",")}&is_archieved=false`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!projectsRes.ok) {
      throw new Error("Failed to fetch projects");
    }
    const projects = await projectsRes.json();

    // Map tasks with project titles, add fallback for missing titles
    const tasksWithProjects = tasks.map((task) => {
      const project = projects.find((p) => p.id === task.project_id);
      return {
        ...task,
        project_title: project?.title || "Unknown Project",
      };
    });

    return tasksWithProjects;
  } catch (error) {
    console.error(
      "Error in apiGetAssigneeTasksInParticipatedProjects:",
      error.message
    );
    return [];
  }
};

export const apiArchieveTask = async (taskId, { is_deleted }) => {
  try {
    const newBody = {
      is_deleted,
      deleted_at: is_deleted ? new Date().toISOString() : null,
    };
    const res = await fetch(`${API.TASK_URI}/${taskId}`, {
      body: JSON.stringify(newBody),
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to archieve task");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetCommentDetail = async (commentId) => {
  try {
    const res = await fetch(`${API.COMMENT_URI}/${commentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to get comment detail");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// export const apiCreateComment = async (
//   taskId,
//   content,
//   userId,
//   parentId = null
// ) => {
//   try {
//     // Determine the comment type (parent comment or reply)
//     const commentType = parentId && parentId !== "" ? "comment_reply" : "comment"; // If parentId is provided, it's a reply

//     const commentData = {
//       id: uuidv4(),
//       task_id: taskId,
//       user_id: userId,
//       content,
//       parent_id: parentId,
//       comment_type: commentType, // Set the comment_type here
//       created_at: new Date().toISOString(),
//     };

//     const res = await fetch(`${API.COMMENT_URI}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(commentData),
//     });

//     if (!res.ok) {
//       throw new Error("Failed to create comment!");
//     }
//     const taskData = await apiGetTaskDetail(taskId);
//     const projectData = await apiGetProjectDetail(taskData?.project_id);
//     const userData = await apiGetUserDetail(userId);
//     const parentCommentUser = await apiGetCommentDetail(parentId);
//     if (commentType === "comment") {
//       await apiCreateNotifications({
//         id: uuidv4(),
//         type: TASK_COMMENT,
//         task_id: taskId,
//         recipient_id: projectData?.owner_id,
//         initiator_id: userId,
//         message: `${userData?.first_name} ${userData?.last_name} commented on task '${taskData?.title}' in ${projectData?.title}.`,
//         status: "Unread",
//         created_at: dayjs().toISOString(),
//       });
//     } else if (commentType === "comment_reply") {
//       await apiCreateNotifications({
//         id: uuidv4(),
//         type: TASK_REPLY,
//         task_id: taskId,
//         recipient_id: parentCommentUser?.user_id,
//         initiator_id: userId,
//         message: `${userData?.first_name} ${userData?.last_name} replied to a comment on task '${taskData?.title}' in ${projectData?.title}.`,
//         status: "Unread",
//         created_at: dayjs().toISOString(),
//       });
//     }
//     return await res.json();
//   } catch (error) {
//     throw new Error(error.message || "Unknown error");
//   }
// };

export const apiCreateComment = async (
  taskId,
  content,
  userId,
  parentId = null
) => {
  try {
    const commentType =
      parentId && parentId !== "" ? "comment_reply" : "comment";
    const commentData = {
      id: uuidv4(),
      task_id: taskId,
      user_id: userId,
      content,
      parent_id: parentId,
      comment_type: commentType,
      created_at: new Date().toISOString(),
    };

    const res = await fetch(`${API.COMMENT_URI}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    });

    // Allow 200 and 201 as success
    if (![200, 201].includes(res.status)) {
      const errorBody = await res.text();
      console.error(
        `Failed to create comment: Status ${res.status}, Body: ${errorBody}`
      );
      throw new Error(`Failed to create comment: ${res.status} ${errorBody}`);
    }

    let taskData, projectData, userData, parentCommentUser;
    try {
      taskData = await apiGetTaskDetail(taskId);
      projectData = await apiGetProjectDetail(taskData?.project_id);
      userData = await apiGetUserDetail(userId);
      parentCommentUser = parentId ? await apiGetCommentDetail(parentId) : null;

      if (commentType === "comment") {
        await apiCreateNotifications({
          id: uuidv4(),
          type: TASK_COMMENT,
          task_id: taskId,
          recipient_id: projectData?.owner_id,
          initiator_id: userId,
          message: `${userData?.first_name} ${userData?.last_name} commented on task '${taskData?.title}' in ${projectData?.title}.`,
          status: "Unread",
          created_at: dayjs().toISOString(),
        });
      } else if (
        commentType === "comment_reply" &&
        parentCommentUser?.user_id !== userId
      ) {
        await apiCreateNotifications({
          id: uuidv4(),
          type: TASK_REPLY,
          task_id: taskId,
          recipient_id: parentCommentUser?.user_id,
          initiator_id: userId,
          message: `${userData?.first_name} ${userData?.last_name} ${
            projectData?.owner_id === userId ? `(Owner)` : ``
          } replied to your comment '${parentCommentUser?.content}' on task '${
            taskData?.title
          }' in ${projectData?.title}.`,
          status: "Unread",
          created_at: dayjs().toISOString(),
        });
      }
    } catch (notificationError) {
      console.warn("Notification creation failed:", notificationError.message);
      // Continue execution instead of throwing
    }

    return await res.json();
  } catch (error) {
    console.error("Error in apiCreateComment:", error.message);
    throw error;
  }
};
export const apiDeleteSingleComment = async (commentId, userId) => {
  try {
    const res = await fetch(`${API.COMMENT_URI}/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete comment with ID: ${commentId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const apiDeleteCommentByParentID = async (parentId, userId) => {
  try {
    // Step 1: Fetch the parent comment to verify its type
    const parentRes = await fetch(`${API.COMMENT_URI}/${parentId}`);
    if (!parentRes.ok) {
      throw new Error(`Failed to fetch parent comment with ID: ${parentId}`);
    }
    const parentComment = await parentRes.json();

    // Step 2: Ensure the comment is a parent (comment_type="comment")
    if (parentComment.comment_type !== "comment") {
      throw new Error(`Comment with ID: ${parentId} is not a parent comment`);
    }

    // Step 3: Delete only the parent comment
    const deleteParentRes = await fetch(`${API.COMMENT_URI}/${parentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }), // Optional: for authorization
    });

    if (!deleteParentRes.ok) {
      throw new Error(`Failed to delete parent comment with ID: ${parentId}`);
    }

    console.log("Parent comment deleted successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error during comment deletion:", error);
    return { success: false, error: error.message };
  }
};

// Fetch all comments for a specific task
export const apiGetCommentsByTask = async (taskId) => {
  try {
    const res = await fetch(`${API.COMMENT_URI}?task_id=${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch comments!");
    }

    const comments = await res.json();
    return comments;
  } catch (error) {
    throw new Error(error.message || "Unknown error");
  }
};

// Edit a comment by updating its content
export const apiEditComment = async (commentId, newContent, userId) => {
  try {
    const updatedData = {
      content: newContent,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${API.COMMENT_URI}/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) {
      throw new Error("Failed to edit comment!");
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Unknown error");
  }
};

export const apiGetAllUsers = async () => {
  try {
    const res = await fetch(`${API.USER_URI}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users!");
    }

    const users = await res.json();
    return users;
  } catch (error) {
    throw new Error(error.message || "Unknown error");
  }
};

export const apiGetCommentReactions = async (commentId) => {
  const res = await fetch(
    `${API.COMMENT_REACTIONS_URI}?comment_id=${commentId}`
  );
  if (!res.ok) throw new Error("Failed to fetch comment reactions");
  return await res.json();
};

export const apiReactToComment = async (commentId, userId, reactionType) => {
  try {
    // Check for existing reactions
    const res = await fetch(
      `${API.COMMENT_REACTIONS_URI}?comment_id=${commentId}&user_id=${userId}`
    );
    if (!res.ok)
      throw new Error(`Failed to fetch existing reactions: ${res.statusText}`);
    const existing = await res.json();

    const sameReaction = existing.find((r) => r.reaction_type === reactionType);

    if (sameReaction) {
      // Toggle off the existing reaction
      const deleteRes = await fetch(
        `${API.COMMENT_REACTIONS_URI}/${sameReaction.id}`,
        {
          method: "DELETE",
        }
      );
      if (!deleteRes.ok)
        throw new Error(`Failed to delete reaction: ${deleteRes.statusText}`);
      return { success: true, action: "deleted", reaction: sameReaction };
    }

    // Add new reaction
    const newReaction = {
      id: uuidv4(),
      comment_id: commentId,
      user_id: userId,
      reaction_type: reactionType,
      created_at: new Date().toISOString(),
    };

    const createRes = await fetch(`${API.COMMENT_REACTIONS_URI}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReaction),
    });

    if (!createRes.ok)
      throw new Error(`Failed to add reaction: ${createRes.statusText}`);
    const commentReaction = await createRes.json();

    // Create notification asynchronously (non-blocking)
    try {
      // Fetch comment data first
      const commentData = await apiGetCommentDetail(commentId);
      console.log("comment data: ", commentData);

      if (!commentData?.task_id || !commentData?.user_id) {
        throw new Error("Invalid comment data: missing task_id or user_id");
      }

      // Fetch task data using commentData.task_id
      const taskData = await apiGetTaskDetail(commentData.task_id);
      if (!taskData?.project_id || !taskData?.title) {
        throw new Error("Invalid task data: missing project_id or title");
      }

      // Fetch project and user data concurrently
      const [projectData, userData] = await Promise.all([
        apiGetProjectDetail(taskData.project_id),
        apiGetUserDetail(userId),
      ]);

      if (!projectData?.title) {
        throw new Error("Invalid project data: missing title");
      }
      if (!userData?.first_name || !userData?.last_name) {
        throw new Error("Invalid user data: missing first_name or last_name");
      }

      // Create notification
      if (commentData?.user_id !== userId) {
        await apiCreateNotifications({
          id: uuidv4(),
          type: TASK_COMMENT_REACTION,
          task_id: commentData.task_id,
          recipient_id: commentData.user_id,
          initiator_id: userId,
          message: `${userData.first_name} ${userData.last_name} ${
            projectData?.owner_id === userId ? `(Owner)` : ``
          } have reacted ${reactionType} to your comment '${
            commentData.content
          }' on task '${taskData.title}' in ${projectData.title}.`,
          status: "Unread",
          created_at: dayjs().toISOString(),
        });
      }
    } catch (notificationError) {
      console.error("Failed to create notification:", {
        message: notificationError.message,
        commentId,
        userId,
        reactionType,
      });
      // Optionally send to a monitoring service (e.g., Sentry)
    }

    return { success: true, action: "created", reaction: commentReaction };
  } catch (error) {
    console.error("Error in apiReactToComment:", {
      message: error.message,
      commentId,
      userId,
      reactionType,
    });
    throw new Error(`Reaction failed: ${error.message}`);
  }
};
