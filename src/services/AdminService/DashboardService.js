import { API } from "../../constants/api.constants";

export const apiRenderArchivedProjects = async () => {
  try {
    const res = await fetch(API.PROJECT_URI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch archived projects");
    }
    const archivedProjects = await res.json();
    return archivedProjects.filter((project) => project.is_archieved === true);
  } catch (error) {
    throw new Error(error.message);
  }
};
