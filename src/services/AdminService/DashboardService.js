import { API } from "../../constants/api.constants";
import { apiGetUserDetail } from "./ManageUsersService";

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

export const getArchivedProjectsWithUserDetails = async () => {
  try {
    // Lấy danh sách archived projects
    const archivedProjects = await apiRenderArchivedProjects();

    // Duyệt qua từng project và lấy thông tin user dựa trên owner_id
    const projectsWithUserDetails = await Promise.all(
      archivedProjects.map(async (project) => {
        try {
          // Gọi apiGetUserDetail để lấy thông tin user
          const user = await apiGetUserDetail(project.owner_id);
          // Kết hợp thông tin project và user
          return {
            ...project,
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
            },
          };
        } catch (error) {
          console.error(`Error fetching user details for owner_id ${project.owner_id}:`, error.message);
          // Trả về project với user rỗng nếu lỗi
          return {
            ...project,
            user: {
              first_name: null,
              last_name: null,
            },
          };
        }
      })
    );

    return projectsWithUserDetails;
  } catch (error) {
    console.error("Error fetching archived projects:", error.message);
    throw new Error("Failed to fetch archived projects with user details");
  }
};
