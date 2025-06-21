import { API } from "../../constants/api.constants";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

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
      throw new Error(`Failed to fetch tasks with assignees!`);
    }
    const tasks = await res.json();
    console.log("tasks with assignees in api service: ", tasks);
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
        return tasks.filter((task) => task.assignee_ids.includes(assigneeId) && task.is_deleted === false);
      } catch (error) {
        console.warn(`Error fetching tasks for project ${projectId}:`, error.message);
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
