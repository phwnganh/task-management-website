import {
  apiGetProjectByUser,
  apiGetProjectList,
} from "./ManageProjectsService";
import { apiGetTaskList } from "./ManageTasksService";
import dayjs from "dayjs";
import { API } from "../../constants/api.constants";

export const apiGetUserProjectStatistics = async (userId) => {
  try {
    const [projects, tasks, projectMembers] = await Promise.all([
      apiGetProjectList(),
      apiGetTaskList(),
      apiGetProjectByUser(),
    ]);

    const userProjects = [];

    const ownedProjects = projects.filter(
      (project) => project.owner_id === userId && project.is_archieved === false
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
    const ownedProjectsCount = ownedProjects.length;
    const memberProjectsCount = memberProjects.length;
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
      if (
        completedTasks.length === projectTasks.length &&
        projectTasks.length > 0
      ) {
        completedProjects++;
      } else {
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

export const apiGetProjectMembers = async (projectId) => {
  const res = await fetch(
    `${API.PROJECT_MEMBER_URI}?project_id=${projectId}&role=Member&invite_status=Accepted`
  );
  return await res.json();
};

export const apiGetAllUsers = async () => {
  const res = await fetch(`${API.USER_URI}`);
  return await res.json();
};

export const apiGetTasksByProject = async (projectId) => {
  const res = await fetch(`${API.TASK_URI}?project_id=${projectId}`);
  return await res.json();
};

export const apiGetUserArchivedProjectStatistics = async (userId) => {
  try {
    const projects = await apiGetProjectList();

    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const archivedProjects = projects.filter(
      (project) => project.owner_id === userId && project.is_archieved === true
    );
    const archivedLessThan7Days = archivedProjects.filter(
      (project) =>
        new Date(project.archived_at) >= sevenDaysAgo &&
        new Date(project.archived_at) <= currentDate
    ).length;
    const archived7To30Days = archivedProjects.filter(
      (project) =>
        new Date(project.archived_at) >= thirtyDaysAgo &&
        new Date(project.archived_at) < sevenDaysAgo
    ).length;

    const archivedMoreThan30Days = archivedProjects.filter(
      (project) => new Date(project.archived_at) < thirtyDaysAgo
    ).length;

    return {
      archivedLessThan7Days,
      archived7To30Days,
      archivedMoreThan30Days,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetArchivedProjectStatistics = async () => {
  try {
    const projects = await apiGetProjectList();
    const statistics = {
      activeProjects: 0,
      archivedProjects: 0,
    };
    if (projects && Array.isArray(projects)) {
      projects.forEach((project) => {
        if (project.is_archieved) {
          statistics.archivedProjects += 1;
        } else {
          statistics.activeProjects += 1;
        }
      });
    }

    return {
      ...statistics,
      pieChartData: [
        { name: "Active Projects", value: statistics.activeProjects },
        { name: "Archived Projects", value: statistics.archivedProjects },
      ],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
