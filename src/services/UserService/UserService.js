
import { API } from "../../constants/api.constants";
import { v4 as uuidv4 } from "uuid";
// service for projects
export const apiGetProjectList = async () => {
  try {
    const res = await fetch(`${API.PROJECT_URI}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch project list!`);
    }
    const projects = await res.json();
    console.log("projects in api service: ", projects);

    return projects && Array.isArray(projects)
      ? projects
      : Array.isArray(projects)
      ? projects
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetProjectByUser = async () => {
  try {
    const res = await fetch(`${API.PROJECT_MEMBER_URI}`);
    if (!res.ok) {
      throw new Error("Failed to fetch project members");
    }
    const projectMembers = await res.json();
    console.log("user projects in api service: ", projectMembers);

    return projectMembers && Array.isArray(projectMembers)
      ? projectMembers
      : Array.isArray(projectMembers)
      ? projectMembers
      : [];
  } catch (error) {
    console.error("Error fetching project members:", error);
    return [];
  }
};

export const apiGetProjectDetail = async (projectId) => {
  try {
    const res = await fetch(`${API.PROJECT_URI}/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch project detail!`);
    }
    const projects = await res.json();
    console.log("projects in api service detail: ", projects);

    return projects
    
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetFavoriteProjects = async (userId) => {
  try {
    const res = await fetch(`${API.FAVORITE_PROJECT_URI}?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch favorite projects!`);
    }
    const favorites = await res.json();
    console.log("favorite projects in api service: ", favorites);

    return favorites && Array.isArray(favorites)
      ? favorites
      : Array.isArray(favorites)
      ? favorites
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiAddFavoriteProject = async (userId, projectId) => {
  try {
    const res = await fetch(`${API.FAVORITE_PROJECT_URI}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: uuidv4(),
        user_id: userId,
        project_id: projectId,
        created_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to add favorite project!`);
    }
    const newFavorite = await res.json();
    console.log("added favorite project: ", newFavorite);

    return newFavorite;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiRemoveFavoriteProject = async (favoriteId) => {
  try {
    const res = await fetch(`${API.FAVORITE_PROJECT_URI}/${favoriteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to remove favorite project!`);
    }
    console.log(`Removed favorite project with id: ${favoriteId}`);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetRecentlyViewedProject = async (userId) => {
  try {
    const response = await fetch(
      `${API.RECENNTLY_VIEWED_PROJECT}?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recently viewed projects");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching recently viewed projects:", error);
    throw error; // Ném lỗi để xử lý ở nơi gọi hàm
  }
};
export const apiUpdateRecentlyViewedProject = async (projectId, userId) => {
  try {
    const recentlyViewedProject = await fetch(
      `${API.RECENNTLY_VIEWED_PROJECT}`,
      {
        method: "POST",
        body: JSON.stringify({
          id: uuidv4(),
          project_id: projectId,
          user_id: userId,
          viewed_at: new Date().toISOString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to update recently project viewed!`);
    }
    const res = await recentlyViewedProject.json();
    return res;
  } catch (error) {
    throw new Error(error);
  }
};

// service for tasks

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
    const res = await fetch(`${API.TASK_URI}?assignee_ids=${assigneeId}&project_id=${projectId}`, {
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
      method: 'PATCH',
      body: JSON.stringify({
        status: newStatus
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (!res.ok) {
      throw new Error(`Failed to update task status!`);
    }
    return await res.json()
  } catch (error) {
    throw new Error(error)
  }
}
// service for project members
export const apiGetProjectMembers = async (projectId) => {
  try {
    const res = await fetch(
      `${API.PROJECT_MEMBER_URI}?project_id=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch project members for project ${projectId}!`
      );
    }

    const projectMembers = await res.json();
    // Lọc các thành viên có invite_status là "Accepted"
    const acceptedMembers = projectMembers.filter(
      (member) => member.invite_status === "Accepted"
    );

    const memberDetails = await Promise.all(
      acceptedMembers.map(async (member) => {
        const userRes = await fetch(`${API.USER_URI}/${member.user_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!userRes.ok) {
          throw new Error(
            `Failed to fetch user details for user ${member.user_id}!`
          );
        }

        const user = await userRes.json();
        return {
          ...member,
          user_details: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar_url: user.avatar_url,
          },
          is_owner: member.role === "Owner",
        };
      })
    );
    return Array.isArray(memberDetails) ? memberDetails : [];
  } catch (error) {
    throw new Error(error);
  }
};

export const apiGetTasksWithAssigneesByProject = async (projectId) => {
  try {
    const tasks = await apiGetTaskListByProject(projectId);
    const projectMembers = await apiGetProjectMembers(projectId);

    const validProjectMembers = projectMembers.filter(
      (member) => member.invite_status === "Accepted"
    );

    const enrichedTasks = tasks.map((task) => {
      const valiidAssignees = task.assignee_ids
        .filter((assigneeId) =>
          validProjectMembers.some((member) => member.user_id === assigneeId)
        )
        .map((assigneeId) => {
          const member = validProjectMembers.find(
            (m) => m.user_id === assigneeId
          );
          return member
            ? {
                id: member.user_details.id,
                first_name: member.user_details.first_name,
                last_name: member.user_details.last_name,
                avatar_url: member.user_details.avatar_url || "",
              }
            : null;
        })
        .filter((assignee) => assignee !== null);
      return {
        ...task,
        assignees: valiidAssignees,
      };
    });
    console.log("Enriched tasks with assignees for project: ", enrichedTasks);
    return enrichedTasks;
  } catch (error) {
    throw new Error(`Error fetching tasks with assignees: ${error.message}`);
  }
};
