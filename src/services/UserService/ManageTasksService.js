import { API } from "../../constants/api.constants";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { GoogleGenerativeAI } from "@google/generative-ai"; // <--- NEW IMPORT for Gemini AI
// import { apiGetProjectList } from "./ManageProjectsService"; // Keeping this as it was in your provided file.

// !! IMPORTANT: Replace with your actual Gemini API Key !!
// For production, load this securely from an environment variable or a backend.
// DO NOT hardcode API keys directly in client-side code in a real application.
const API_KEY = "AIzaSyAWwGuKnaG_vzyitBkC8FCQKPTXNEub1q8"; // <--- REPLACE THIS LINE WITH YOUR ACTUAL API KEY

const genAI = new GoogleGenerativeAI(API_KEY);
// Choose a model: gemini-1.5-flash is generally faster and cheaper for this task.
// gemini-1.5-pro is more capable but may be slower/pricier.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const res = await fetch(
      `${API.TASK_URI}?assignee_ids=${assigneeId}&project_id=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch task list for assignee!`);
    }
    const tasks = await res.json();
    console.log("tasks by assignee in api service: ", tasks);

    const filteredTasks = Array.isArray(tasks)
      ? tasks.filter((task) => task.is_deleted === false)
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
    if (!res.ok) {
      throw new Error("Failed to update task!");
    }
    return res.json();
  } catch (error) {
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
        user_id: userId
      })
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
        const res = await fetch(
          `${API.TASK_URI}?project_id=${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch tasks for project ${projectId}`);
        }
        const tasks = await res.json();
        return tasks.filter((task) => task.assignee_ids.includes(assigneeId));
      } catch (error) {
        console.warn(`Error fetching tasks for project ${projectId}:`, error.message);
        return [];
      }
    });

    const tasksResults = await Promise.all(tasksPromises);
    const tasks = tasksResults.flat();

    // Fetch projects using _id_in query
    const projectsRes = await fetch(
      `${API.PROJECT_URI}?_id_in=${projectIds.join(",")}`,
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
    console.error("Error in apiGetAssigneeTasksInParticipatedProjects:", error.message);
    return [];
  }
};

export const apiArchieveTask = async (taskId, {is_deleted}) => {
  try {
    const newBody = {
      is_deleted,
      deleted_at: is_deleted ? new Date().toISOString() : null
    }
    const res = await fetch(`${API.TASK_URI}/${taskId}`, {
      body: JSON.stringify(newBody),
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      }
    })
    if(!res.ok){
      throw new Error('Failed to archieve task')
    }
    return await res.json()
  } catch (error) {
    throw new Error(error.message)
  }
}

// NOTE: I am using the apiCreateComment that was active in your provided file.
// The commented-out apiCreateComment below it was NOT used.
export const apiCreateComment = async (taskId, commentText, userId, parentId = null) => {
  if (!taskId || !userId) {
    throw new Error(`Missing taskId (${taskId}) or userId (${userId})!`);
  }

  try {
    
    const commentType = parentId ? 'comment_reply' : 'comment';

    
    const newComment = {
      id: uuidv4(),
      task_id: taskId,
      user_id: userId,
      content: commentText, 
      parent_id: parentId, 
      comment_type: commentType,
      created_at: new Date().toISOString(), 
     
    };
 
    const response = await fetch(API.COMMENT_URI, { // Correctly uses the constant from api.constants.js
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    });

    if (!response.ok) {
      throw new Error("Failed to create comment");
    }

    return await response.json();
  } catch (err) {
    console.error("Error creating comment:", err);
    throw err;
  }
};

// API call to get comments by task ID
export const apiGetCommentsByTask = async (taskId) => {
  try {
    const res = await fetch(`${API.COMMENT_URI}?task_id=${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("Error fetching comments:", res.statusText);
      throw new Error("Failed to fetch comments by task!");
    }

    const data = await res.json();
    console.log("Fetched Comments:", data); // Log the response data

    // This function now returns ALL comments for the task directly
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in apiGetCommentsByTask:", error);
    throw new Error(error.message);
  }
};

// API call to delete a comment by comment ID (Hard Delete)
export const apiDeleteComments = async (commentIds, userId) => { // userId is not strictly necessary for RESTful DELETE without a body
  console.log("Attempting to hard-delete comment IDs:", commentIds); // Log IDs being sent
  let failedDeletions = [];

  for (const id of commentIds) {
    try {
      const response = await fetch(`${API.COMMENT_URI}/${id}`, {
        method: "DELETE", // <--- Use DELETE method for permanent removal
        headers: {
          "Content-Type": "application/json",
        },
        // IMPORTANT: Removed body from DELETE request for cleaner operation with json-server
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to hard-delete comment ID ${id}. Status: ${response.status}, Response: ${errorText}`);
        failedDeletions.push(id);
      } else {
        console.log(`Successfully hard-deleted comment ID: ${id}`);
      }
      // Introduce a small delay (e.g., 50ms) to help json-server persist changes
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error during hard-delete request for ID ${id}:`, error);
      failedDeletions.push(id);
    }
  }

  if (failedDeletions.length > 0) {
    throw new Error(`Failed to hard-delete comments: ${failedDeletions.join(', ')}. Check console for details.`);
  }
  console.log("All hard-delete operations completed successfully (or errors logged for specific failures).");
  return { success: true, deletedIds: commentIds.filter(id => !failedDeletions.includes(id)) };
};


export const apiGetAllUsers = async () => {
  try {
    const res = await fetch(API.USER_URI, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch users!");
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// --- NEW FUNCTION: Gemini AI Comment Validation ---
/**
 * Validates a user comment against a task's title and description using Gemini AI.
 * @param {string} taskTitle - The title of the task.
 * @param {string} taskDescription - The description of the task.
 * @param {string} commentContent - The content of the user's comment.
 * @returns {Promise<{isValid: boolean, reason: string}>} An object indicating
 * if the comment is valid and a reason for the assessment.
 */
export const validateCommentWithGeminiGeneration = async (
  taskTitle,
  taskDescription,
  commentContent
) => {
  const prompt = `
    Given the following task details and a user comment, determine if the comment is relevant to the task.
    Provide a concise answer: "VALID" if relevant, "INVALID" if not relevant.
    Also, provide a brief reason for your assessment.

    Task Title: "${taskTitle}"
    Task Description: "${taskDescription}"
    User Comment: "${commentContent}"

    Response Format:
    VALIDATION: [VALID/INVALID]
    REASON: [Your reason here]
    `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); // Get the raw text response from Gemini

    // Parse the response based on the defined format
    const validationMatch = responseText.match(/VALIDATION: (VALID|INVALID)/i);
    const reasonMatch = responseText.match(/REASON: (.+)/i);

    const isValid = validationMatch
      ? validationMatch[1].toUpperCase() === "VALID"
      : false; // Default to false if validation pattern not found
    const reason = reasonMatch ? reasonMatch[1].trim() : "No reason provided by AI.";

    return {
      isValid: isValid,
      reason: reason,
    };
  } catch (error) {
    console.error("Error validating comment with Gemini AI:", error);
    return {
      isValid: false,
      reason: "An error occurred during AI validation. Please try again later.",
    };
  }
};