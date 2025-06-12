import {
  apiGetProjectByUser,
  apiGetProjectList,
} from "./ManageProjectsService";
import { apiGetTaskList } from "./ManageTasksService";

export const apiGetUserProjectStatistics = async (userId) => {
  try {
    const [projects, tasks, projectMembers] = await Promise.all([
      apiGetProjectList(),
      apiGetTaskList(),
      apiGetProjectByUser(),
    ]);

    const userProjects = [];

    const ownedProjects = projects.filter(
      (project) => project.owner_id === userId
    );
    userProjects.push(...ownedProjects);

    const memberProjects = projectMembers
      .filter(
        (member) =>
          member.user_id === userId &&
          member.role === "Member" &&
          member.invite_status === "Accepted"
      )
      .map((member) =>
        projects.find((project) => project.id === member.project_id)
      )
      .filter(
        (project) => project && !userProjects.some((p) => p.id === project.id)
      );

    userProjects.push(...memberProjects);

    const totalProjects = userProjects.length;
    const ownedProjectsCount = ownedProjects.length
    const memberProjectsCount = memberProjects.length
    let completedProjects = 0;
    let inProgressProjects = 0;

    for (const project of userProjects) {
      const projectTasks = tasks.filter(
        (task) => task.project_id === project.id
      );
      if (projectTasks.length === 0) {
        inProgressProjects++;
        continue;
      }

      const completedTasks = projectTasks.filter(
        (task) => task.status === "Completed"
      );
      if (completedTasks.length === projectTasks.length && projectTasks.length > 0) {
        completedProjects++;
      } else{
        inProgressProjects++;
      }
    }

    return {
      totalProjects,
      ownedProjects: ownedProjectsCount,
      memberProjects: memberProjectsCount,
      completedProjects,
      inProgressProjects,
    };
  } catch (error) {
    console.error("Error calculating user project stats:", error);
    return {
      totalProjects: 0,
      ownedProjects: 0,
      memberProjects: 0,
      completedProjects: 0,
      inProgressProjects: 0,
    };
  }
};
