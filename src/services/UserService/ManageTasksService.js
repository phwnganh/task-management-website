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

    return tasks && Array.isArray(tasks)
      ? tasks
      : Array.isArray(tasks)
      ? tasks
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiUpdateTaskStatus = async (taskId, newStatus) => {
  try {
    const res = await fetch(`${API.TASK_URI}/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to update task status!`);
    }
    return await res.json();
  } catch (error) {
    throw new Error(error);
  }
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
        ? dayjs(updates.start_date).format("YYYY-MM-DD")
        : undefined,
      due_date: updates.due_date
        ? dayjs(updates.due_date).format("YYYY-MM-DD")
        : undefined,
      updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
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
  const res = await fetch(`${API.TASK_URI}/${task_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) {
    throw new Error("Failed to update task!");
  }
  return res.json();
};
