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
    const projectMembers = await res.json()
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
