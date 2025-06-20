import { readTransformValue } from "framer-motion";
import { API } from "../../constants/api.constants";
import { apiGetTaskListByProject } from "./ManageTasksService";
import { v4 as uuidv4 } from "uuid";

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

export const apiGetProjectOwner = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error("Project ID is required to fetch owner.");
    }
    const members = await apiGetProjectMembers(projectId);
    const owner = members.find(member => member.role === "Owner");

    if (!owner) {
      throw new Error(`No owner found with role 'Owner' for project ${projectId}.`);
    }

    // Trim the ID to remove any potential whitespace issues
    return { id: owner.user_details.id.trim() }; // <--- Added .trim() here
  } catch (error) {
    console.error("Error in apiGetProjectOwner:", error);
    throw new Error(error.message);
  }
};

export const apiGetPendingProjectMembers = async (projectId) => {
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
        `Failed to fetch project members for project ${projectId}`
      );
    }

    const projectMembers = await res.json();

    const pendingMembers = projectMembers.filter(
      (member) => member.invite_status === "Pending"
    );

    const pendingMemberDetails = await Promise.all(
      pendingMembers.map(async (member) => {
        const userRes = await fetch(`${API.USER_URI}/${member.user_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!userRes.ok) {
          throw new Error(
            `Failed to fetch user details for user ${member.user_id}`
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
            avatar_url: user.avatar_url || "",
          },
        };
      })
    );

    return pendingMemberDetails;
  } catch (error) {
    console.error("Error fetching pending project members:", error);
    return [];
  }
};

export const apiGetProjectMemberDetail = async (id) => {
  try {
    const res = await fetch(`${API.PROJECT_MEMBER_URI}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch project member");
    }
    const projectMember = await res.json();
    return projectMember;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const searchUsersNotInProject = async (projectId) => {
  try {
    // 1. Fetch all users
    const usersRes = await fetch(API.USER_URI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!usersRes.ok) {
      throw new Error("Failed to fetch users");
    }

    const allUsers = await usersRes.json();

    // 2. Fetch current project members
    const membersRes = await fetch(
      `${API.PROJECT_MEMBER_URI}?project_id=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!membersRes.ok) {
      throw new Error("Failed to fetch project members");
    }

    const members = await membersRes.json();
    const memberIds = members.map((member) => member.user_id);

    // 3. Filter out users who are already project members
    const nonMembers = allUsers.filter((user) => !memberIds.includes(user.id));

    return nonMembers;
  } catch (error) {
    console.error("Error fetching users not in project:", error);
    return [];
  }
};

export const apiProjectAddMember = async (body) => {
  try {
    const res = await fetch(`${API.PROJECT_MEMBER_URI}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error("Failed to add member to the project");
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding member:", error);
  }
};

export const apiRemoveProjectMember = async (projectId, memberId) => {
  try {
    const res = await fetch(`${API.PROJECT_MEMBER_URI}/${memberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: projectId }),
    });
    if (!res.ok) {
      throw new Error("Failed to remove member from the project");
    }
    return await res.json();
  } catch (error) {
    console.error("Error removing member:", error);
  }
};

export const apiGetOtherProjectMembers = async (projectId, currentUserId) => {
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
      (member) =>
        (member.invite_status === "Accepted") &
        (member.user_id !== currentUserId)
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

export const apiChangeInvitationProjectStatus = async (projectMemberId, newStatus) => {
  try {
    const res = await fetch(`${API.PROJECT_MEMBER_URI}/${projectMemberId}`, {
      method: "PATCH",
      body: JSON.stringify({
        invite_status: newStatus
      }),
      headers: {
        "Content-Type": "application/json",
      }
    })
    if(!res.ok){
      throw new Error("Failed to update status!")
    }
    return await res.json()
  } catch (error) {
    throw new Error(error.message)
  }
}

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

export const apiGetTasksExcludingCurrentUser = async (
  projectId,
  currentUserId
) => {
  try {
    const tasks = await apiGetTaskListByProject(projectId);
    console.log("Tasks from apiGetTaskListByProject:", tasks);

    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", tasks);
      return [];
    }

    // Filter tasks to include only those with is_deleted = false
    const nonDeletedTasks = tasks.filter((task) => task.is_deleted === false);
    console.log("Non-deleted tasks:", nonDeletedTasks);

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
            console.error(
              `Failed to fetch user details for user ${member.user_id}`
            );
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

    const filteredTasks = nonDeletedTasks.filter(
      (task) => !task.assignee_ids?.includes(currentUserId)
    );
    console.log("Filtered tasks (excluding current user):", filteredTasks);

    const enrichedTasks = filteredTasks.map((task) => {
      const validAssignees =
        task.assignee_ids
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
    throw new Error(
      `Error fetching tasks excluding current user: ${error.message}`
    );
  }
};
