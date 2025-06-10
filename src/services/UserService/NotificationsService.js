import { API } from "../../constants/api.constants";
import {
  PROJECT_INVITATION,
  PROJECT_INVITATION_ACCEPTED,
  TASK_ATTACHMENT_UPLOADED,
  TASK_COMMENT,
  TASK_COMMENT_DELETED,
  TASK_EDIT_REQUEST,
  TASK_EDIT_REQUEST_ACCEPTED,
  TASK_NEARING_DUE_DATE,
  TASK_OVERDUE,
  TASK_REPLY,
} from "../../constants/notifications.constants";
import { apiGetUserList } from "../AdminService/ManageUsersService";
import { apiGetProjectList } from "./ManageProjectsService";
import { apiGetTaskList } from "./ManageTasksService";

export const apiGetNotifications = async (userId) => {
  try {
    const res = await fetch(`${API.NOTIFICATION_URI}?recipient_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch notifications list!`);
    }
    const notifications = await res.json();
    const projects = await apiGetProjectList();
    const tasks = await apiGetTaskList();
    const users = await apiGetUserList();

    // Hiển thị thông tin project/task và thông tin chi tiết của initiator
    const enrichedNotifications = Array.isArray(notifications)
      ? notifications.map((notification) => {
          let relatedData = {};
          if (
            notification.type === PROJECT_INVITATION ||
            notification.type === PROJECT_INVITATION_ACCEPTED
          ) {
            const project = projects.find(
              (p) => p.id === notification.project_id
            );
            relatedData = {
              projectTitle: project && project.title,
            };
          } else if (
            notification.type === TASK_EDIT_REQUEST ||
            notification.type === TASK_EDIT_REQUEST_ACCEPTED ||
            notification.type === TASK_NEARING_DUE_DATE ||
            notification.type === TASK_OVERDUE ||
            notification.type === TASK_COMMENT ||
            notification.type === TASK_REPLY ||
            notification.type === TASK_COMMENT_DELETED ||
            notification.type === TASK_ATTACHMENT_UPLOADED
          ) {
            const task = tasks.find((t) => t.id === notification.task_id);
            const project = task
              ? projects.find((p) => p.id === task.project_id)
              : null;
            relatedData = {
              taskTitle: task && task.title,
              projectTitle: project && project.title,
            };
          }
          const initiator = users.find(
            (u) => u.id === notification.initiator_id
          );
          const initiatorObj = initiator && {
            first_name: initiator.first_name,
            last_name: initiator.last_name,
            avatar_url: initiator.avatar_url,
          };

          return {
            ...notification,
            relatedData,
            initiator: initiatorObj,
          };
        })
      : [];

    return enrichedNotifications;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetUnreadNotificationCount = async (userId) => {
  try {
    const res = await fetch(`${API.NOTIFICATION_URI}?recipient_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch notifications count!`);
    }
    const notifications = await res.json()
    const unreadCount = Array.isArray(notifications) ? notifications.filter(notification => notification.status === "Unread").length : 0
    return unreadCount
  } catch (error) {
      throw new Error(error.message)
  }
};
