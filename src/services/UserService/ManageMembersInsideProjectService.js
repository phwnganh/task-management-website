import { API } from "../../constants/api.constants";
import { apiGetTaskListByProject } from "./ManageTasksService";

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

export const apiGetTasksExcludingCurrentUser = async (projectId, currentUserId) => {
  try {
    const tasks = await apiGetTaskListByProject(projectId);
    console.log("Tasks from apiGetTaskListByProject:", tasks);

    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", tasks);
      return [];
    }

    const projectMembers = await apiGetProjectMembers(projectId);
    console.log("Project members:", projectMembers);

    const acceptedMembers = projectMembers.filter(
      (member) => member.invite_status === "Accepted"
    );
    console.log("Accepted members:", acceptedMembers);

    const memberDetails = await Promise.all(
      acceptedMembers.map(async (member) => {
        try {
          const userRes = await fetch(`${API.USER_URI}/${member.user_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!userRes.ok) {
            console.error(`Failed to fetch user details for user ${member.user_id}`);
            return null;
          }
          const user = await userRes.json();
          console.log(`User details for ${member.user_id}:`, user);
          return {
            ...member,
            user_details: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              avatar_url: user.avatar_url || "",
            },
          };
        } catch (error) {
          console.error(`Error fetching user ${member.user_id}:`, error);
          return null;
        }
      })
    ).then((details) => details.filter((detail) => detail !== null));
    console.log("Member details:", memberDetails);

    const filteredTasks = tasks.filter(
      (task) => !task.assignee_ids?.includes(currentUserId)
    );
    console.log("Filtered tasks (excluding current user):", filteredTasks);

    const enrichedTasks = filteredTasks.map((task) => {
      const validAssignees = task.assignee_ids
        ?.filter((assigneeId) =>
          memberDetails.some((member) => member.user_id === assigneeId)
        )
        .map((assigneeId) => {
          const member = memberDetails.find((m) => m.user_id === assigneeId);
          return member
            ? {
                id: member.user_details.id,
                first_name: member.user_details.first_name,
                last_name: member.user_details.last_name,
                avatar_url: member.user_details.avatar_url || "",
              }
            : null;
        })
        .filter((assignee) => assignee !== null) || [];
      console.log(`Task ${task.id} assignees:`, validAssignees);
      return {
        ...task,
        assignees: validAssignees,
      };
    });

    console.log("Tasks excluding current user:", enrichedTasks);
    return Array.isArray(enrichedTasks) ? enrichedTasks : [];
  } catch (error) {
    console.error("Error fetching tasks excluding current user:", error);
    throw new Error(`Error fetching tasks excluding current user: ${error.message}`);
  }
};