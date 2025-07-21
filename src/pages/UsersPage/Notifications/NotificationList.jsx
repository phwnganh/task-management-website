import React, { useEffect, useState } from "react";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { useAuth } from "../../../context/useAuth";
import {
  apiChangeNotificationStatus,
  apiCreateNotifications,
  apiGetNotifications,
} from "../../../services/UserService/NotificationsService";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  List,
  message,
  notification,
  Skeleton,
  Typography,
} from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  PROJECT_INVITATION,
  PROJECT_INVITATION_ACCEPTED,
  PROJECT_INVITATION_REJECTED,
  TASK_EDIT_REQUEST,
  TASK_EDIT_REQUEST_ACCEPTED,
  TASK_EDIT_REQUEST_REJECTED,
} from "../../../constants/notifications.constants";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  apiChangeRequestContentStatus,
  apiGetRequestToEditTaskDetail,
  apiGetTaskDetail,
  apiUpdateTaskTitleDesc,
} from "../../../services/UserService/ManageTasksService";
import { v4 as uuidv4 } from "uuid";
import {
  apiChangeInvitationProjectStatus,
  apiGetProjectMemberDetail,
} from "../../../services/UserService/ManageMembersInsideProjectService";
import { apiGetProjectDetail } from "../../../services/UserService/ManageProjectsService";
import { useTranslation } from "react-i18next";

const NotificationList = () => {
  const { t } = useTranslation("noti");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const pageSize = 10;

  // const loadMoreData = async () => {
  //   if (isLoading) return;
  //   setIsLoading(true);
  //   try {
  //     const data = await apiGetNotifications(user.id);
  //     const start = (page - 1) * pageSize;
  //     const end = start + pageSize;
  //     const enrichedData = await Promise.all(
  //       data.slice(start, end).map(async (notification) => {
  //         if (
  //           notification.type === TASK_EDIT_REQUEST &&
  //           notification.requestContent_id
  //         ) {
  //           try {
  //             const requestDetail = await apiGetRequestToEditTaskDetail(
  //               notification.requestContent_id
  //             );
  //             return { ...notification, requestStatus: requestDetail.status };
  //           } catch (error) {
  //             return { ...notification, requestStatus: null };
  //           }
  //         } else if (
  //           notification.type === PROJECT_INVITATION &&
  //           notification.projectMember_id
  //         ) {
  //           try {
  //             const projectMemberDetail = await apiGetProjectMemberDetail(
  //               notification.projectMember_id
  //             );
  //             return {
  //               ...notification,
  //               inviteStatus: projectMemberDetail.invite_status || null,
  //             };
  //           } catch (error) {
  //             return { ...notification, inviteStatus: null };
  //           }
  //         }
  //         return notification;
  //       })
  //     );
  //     setNotifications([...notifications, ...enrichedData]);
  //     setPage(page + 1);
  //     setIsLoading(false);
  //   } catch (error) {
  //     message.error(error.message || "Failed to load notifications");
  //     setIsLoading(false);
  //   }
  // };

  const loadMoreData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await apiGetNotifications(user.id);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const enrichedData = await Promise.all(
        data.slice(start, end).map(async (notification) => {
          if (
            notification.type === PROJECT_INVITATION &&
            notification.projectMember_id
          ) {
            try {
              const projectMemberDetail = await apiGetProjectMemberDetail(
                notification.projectMember_id
              );
              if (!projectMemberDetail) {
                return null; // Loại bỏ nếu thành viên đã rời project
              }
              return {
                ...notification,
                inviteStatus: projectMemberDetail.invite_status,
              };
            } catch (error) {
              return null; // Loại bỏ nếu có lỗi lấy thông tin thành viên
            }
          }
          return notification;
        })
      );
      const filteredData = enrichedData.filter((item) => item !== null);
      setNotifications([...notifications, ...filteredData]);
      setPage(page + 1);
      setIsLoading(false);
    } catch (error) {
      message.error(error.message || "Failed to load notifications");
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadMoreData();
    // eslint-disable-next-line
  }, []);

  // Mark notification read/unread
  const handleMarkReadStatus = async (notificationId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Unread" ? "Read" : "Unread";
      const res = await apiChangeNotificationStatus(notificationId, newStatus);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, status: res.status } : notif
        )
      );
      notification.success({
        message: t("Success"),
        description: `${t(
          "Notification marked as"
        )} ${newStatus.toLowerCase()}`,
        placement: "bottomRight",
      });
      window.location.reload();
    } catch (error) {
      notification.error({
        message: t("Error"),
        description: t("Failed to update notification status"),
        placement: "bottomRight",
      });
    }
  };

  // Handle Accept/Reject for TASK_EDIT_REQUEST and PROJECT_INVITATION
  const handleAction = async (
    request_id = null,
    status,
    type,
    projectMember_id = null
  ) => {
    try {
      if (type === TASK_EDIT_REQUEST) {
        const requestDetail = await apiGetRequestToEditTaskDetail(request_id);
        const { task_id, proposed_changes, requester_id } = requestDetail;
        const taskDetailData = await apiGetTaskDetail(task_id);

        // ✅ THÊM ĐOẠN NÀY: cập nhật task nếu được chấp nhận
        if (status === "Accepted") {
          const title = proposed_changes?.title?.trim();
          const description = proposed_changes?.description?.trim();

          if (title || description) {
            await apiUpdateTaskTitleDesc({
              task_id,
              title,
              description,
            });
          }
        }

        // ✅ Cập nhật trạng thái request
        await apiChangeRequestContentStatus(request_id, status);

        // ✅ Tạo notification
        await apiCreateNotifications({
          id: uuidv4(),
          type:
            status === "Accepted"
              ? TASK_EDIT_REQUEST_ACCEPTED
              : TASK_EDIT_REQUEST_REJECTED,
          task_id,
          recipient_id: requester_id,
          status: "Unread",
          initiator_id: user.id,
          message: `${user.first_name} ${user.last_name} 
            has
         ${status.toLowerCase()} your proposed changes in task '${
            taskDetailData?.title
          }'`,
          created_at: new Date().toISOString(),
        });

        // ✅ Cập nhật UI
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.requestContent_id === request_id
              ? { ...notif, requestStatus: status }
              : notif
          )
        );

        notification.success({
          message: t("Success"),
          description: `${t(`statusText.${status.toLowerCase()}`)} ${t(
            "the requested content successfully!"
          )}`,
          placement: "bottomRight",
        });
      } else if (type === PROJECT_INVITATION) {
        const projectMemberDetail = await apiGetProjectMemberDetail(
          projectMember_id
        );
        const { project_id } = projectMemberDetail;
        const projectDetailData = await apiGetProjectDetail(project_id);
        // Update invitation status
        await apiChangeInvitationProjectStatus(projectMember_id, status);
        // Create notification for project owner
        await apiCreateNotifications({
          id: uuidv4(),
          type:
            status === "Accepted"
              ? PROJECT_INVITATION_ACCEPTED
              : PROJECT_INVITATION_REJECTED,
          project_id,
          recipient_id: projectDetailData?.owner_id,
          initiator_id: user.id,
          message: `${user.first_name} ${user.last_name} 
            has
           ${status.toLowerCase()} your invitation to join ${
            projectDetailData?.title
          } as a Member.`,
          status: "Unread",
          created_at: dayjs().toISOString(),
        });
        // Update UI
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.projectMember_id === projectMember_id
              ? { ...notif, inviteStatus: status }
              : notif
          )
        );
        window.location.reload();
        notification.success({
          message: t("Success"),
          description: `${t(`statusText.${status.toLowerCase()}`)} ${t(
            "the project invitation successfully!"
          )}`,
          placement: "bottomRight",
        });
      }
    } catch (error) {
      notification.error({
        message: t("Error"),
        description: error.message || t("Failed to process the request"),
        placement: "bottomRight",
      });
    }
  };

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <div className="flex items-center space-x-4">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
              {t("All Notifications")}
            </h1>
          </div>
        </div>
        <div className="mt-5">
          <div className="overflow-x-auto">
            <InfiniteScroll
              dataLength={notifications.length}
              next={loadMoreData}
              hasMore={notifications.length}
              loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
              endMessage={
                <Divider className="text-gray-500">{t("Nothing more")}</Divider>
              }
              scrollableTarget="scrollableDiv"
            >
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                // renderItem={(item) => (
                //   <List.Item
                //     className="border-b py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0"
                //     key={item.id}
                //     actions={[
                //       item.status === "Unread" ? (
                //         <Button
                //           type="primary"
                //           onClick={() =>
                //             handleMarkReadStatus(item.id, item.status)
                //           }
                //           className="bg-blue-500 border-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                //         >
                //           {t("Mark as Read")}
                //         </Button>
                //       ) : (
                //         <Button
                //           type="default"
                //           onClick={() =>
                //             handleMarkReadStatus(item.id, item.status)
                //           }
                //           className="text-gray-500 border-gray-500 hover:bg-gray-50 w-full sm:w-auto"
                //         >
                //           {t("Mark as Unread")}
                //         </Button>
                //       ),
                //     ]}
                //   >
                //     <List.Item.Meta
                //       avatar={
                //         <Avatar
                //           src={item?.initiator?.avatar_url}
                //           icon={
                //             !item?.initiator?.avatar_url && <UserOutlined />
                //           }
                //           className="mt-1"
                //         />
                //       }
                //       title={
                //         <div className="flex items-center gap-2">
                //           <Typography.Text className="font-semibold text-gray-800">
                //             {item?.initiator?.first_name &&
                //             item?.initiator?.last_name
                //               ? `${item.initiator.first_name} ${item.initiator.last_name}`
                //               : "System"}
                //           </Typography.Text>
                //           {item.status === "Unread" && <Badge status="error" />}
                //         </div>
                //       }
                //       description={
                //         <div className="flex flex-col">
                //           <Typography.Text className="text-gray-600 text-start">
                //             {item.message}
                //           </Typography.Text>
                //           <Typography.Text className="text-gray-400 text-sm mt-1 text-start">
                //             at{" "}
                //             {dayjs(item.created_at).format(
                //               "YYYY-MM-DD HH:mm:ss"
                //             )}
                //           </Typography.Text>
                //           {(item.type === PROJECT_INVITATION ||
                //             item.type === TASK_EDIT_REQUEST) && (
                //             <div className="flex flex-col sm:flex-row gap-2 mt-2">
                //               <Button
                //                 type="primary"
                //                 onClick={() =>
                //                   handleAction(
                //                     item.type === TASK_EDIT_REQUEST
                //                       ? item.requestContent_id
                //                       : null,
                //                     "Accepted",
                //                     item.type,
                //                     item.type === PROJECT_INVITATION
                //                       ? item.projectMember_id
                //                       : null
                //                   )
                //                 }
                //                 className="bg-green-500 border-green-500 hover:bg-green-600 w-full sm:w-auto"
                //                 disabled={
                //                   (item.type === TASK_EDIT_REQUEST &&
                //                     (item.requestStatus === "Accepted" ||
                //                       item.requestStatus === "Rejected")) ||
                //                   (item.type === PROJECT_INVITATION &&
                //                     (item.inviteStatus === "Accepted" ||
                //                       item.inviteStatus === "Rejected"))
                //                 }
                //               >
                //                 {t("Accept")}
                //               </Button>
                //               <Button
                //                 type="default"
                //                 onClick={() =>
                //                   handleAction(
                //                     item.type === TASK_EDIT_REQUEST
                //                       ? item.requestContent_id
                //                       : null,
                //                     "Rejected",
                //                     item.type,
                //                     item.type === PROJECT_INVITATION
                //                       ? item.projectMember_id
                //                       : null
                //                   )
                //                 }
                //                 className="text-red-500 border-red-500 hover:bg-red-50 w-full sm:w-auto"
                //                 disabled={
                //                   (item.type === TASK_EDIT_REQUEST &&
                //                     (item.requestStatus === "Accepted" ||
                //                       item.requestStatus === "Rejected")) ||
                //                   (item.type === PROJECT_INVITATION &&
                //                     (item.inviteStatus === "Accepted" ||
                //                       item.inviteStatus === "Rejected"))
                //                 }
                //               >
                //                 {t("Reject")}
                //               </Button>
                //             </div>
                //           )}
                //           {item.type === TASK_EDIT_REQUEST &&
                //             item.requestStatus === "Accepted" && (
                //               <Typography.Text
                //                 style={{ color: "#52c41a", fontWeight: 500 }}
                //               >
                //                 {t("This change has been Accepted")}
                //               </Typography.Text>
                //             )}
                //           {item.type === TASK_EDIT_REQUEST &&
                //             item.requestStatus === "Rejected" && (
                //               <Typography.Text
                //                 style={{ color: "#ff4d4f", fontWeight: 500 }}
                //               >
                //                 {t("This change has been Rejected")}
                //               </Typography.Text>
                //             )}
                //           {item.type === PROJECT_INVITATION &&
                //             item.inviteStatus === "Accepted" && (
                //               <Typography.Text
                //                 style={{ color: "#52c41a", fontWeight: 500 }}
                //               >
                //                 {t("This invitation has been Accepted")}
                //               </Typography.Text>
                //             )}
                //           {item.type === PROJECT_INVITATION &&
                //             item.inviteStatus === "Rejected" && (
                //               <Typography.Text
                //                 style={{ color: "#ff4d4f", fontWeight: 500 }}
                //               >
                //                 {t("This invitation has been Rejected")}
                //               </Typography.Text>
                //             )}
                //         </div>
                //       }
                //     />
                //   </List.Item>
                // )}
                renderItem={(item) => (
                  <List.Item
                    className="border-b py-4"
                    key={item.id}
                    actions={[
                      item.status === "Unread" ? (
                        <Button
                          type="primary"
                          onClick={() =>
                            handleMarkReadStatus(item.id, item.status)
                          }
                          className="bg-blue-500 border-blue-500 hover:bg-blue-600"
                        >
                          {t("Mark as Read")}
                        </Button>
                      ) : (
                        <Button
                          type="default"
                          onClick={() =>
                            handleMarkReadStatus(item.id, item.status)
                          }
                          className="text-gray-500 border-gray-500 hover:bg-gray-50"
                        >
                          {t("Mark as Unread")}
                        </Button>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item?.initiator?.avatar_url}
                          icon={
                            !item?.initiator?.avatar_url && <UserOutlined />
                          }
                          className="mt-1"
                        />
                      }
                      title={
                        <div className="flex items-center gap-2">
                          <Typography.Text className="font-semibold text-gray-800">
                            {item?.initiator?.first_name &&
                            item?.initiator?.last_name
                              ? `${item.initiator.first_name} ${item.initiator.last_name}`
                              : "System"}
                          </Typography.Text>
                          {item.status === "Unread" && <Badge status="error" />}
                        </div>
                      }
                      description={
                        <div className="flex flex-col gap-2">
                          <Typography.Text className="text-gray-600 text-start">
                            {item.message}
                          </Typography.Text>
                          <Typography.Text className="text-gray-400 text-sm text-start">
                            at{" "}
                            {dayjs(item.created_at).format(
                              "YYYY-MM-DD HH:mm:ss"
                            )}
                          </Typography.Text>

                          {item.type === PROJECT_INVITATION &&
                            item.inviteStatus === "Pending" && (
                              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <Button
                                  type="primary"
                                  onClick={() =>
                                    handleAction(
                                      null,
                                      "Accepted",
                                      item.type,
                                      item.projectMember_id
                                    )
                                  }
                                  className="bg-green-500 border-green-500 hover:bg-green-600"
                                  disabled={
                                    item.inviteStatus === "Accepted" ||
                                    item.inviteStatus === "Rejected"
                                  }
                                  title={
                                    item.inviteStatus === "Accepted" ||
                                    item.inviteStatus === "Rejected"
                                      ? t("Action already taken")
                                      : ""
                                  }
                                >
                                  {t("Accept")}
                                </Button>
                                <Button
                                  type="default"
                                  onClick={() =>
                                    handleAction(
                                      null,
                                      "Rejected",
                                      item.type,
                                      item.projectMember_id
                                    )
                                  }
                                  className="text-red-500 border-red-500 hover:bg-red-50"
                                  disabled={
                                    item.inviteStatus === "Accepted" ||
                                    item.inviteStatus === "Rejected"
                                  }
                                  title={
                                    item.inviteStatus === "Accepted" ||
                                    item.inviteStatus === "Rejected"
                                      ? t("Action already taken")
                                      : ""
                                  }
                                >
                                  {t("Reject")}
                                </Button>
                              </div>
                            )}

                          {item.type === PROJECT_INVITATION &&
                            (item.inviteStatus === "Accepted" ||
                              item.inviteStatus === "Rejected") && (
                              <Typography.Text
                                style={{
                                  color:
                                    item.inviteStatus === "Accepted"
                                      ? "#52c41a"
                                      : "#ff4d4f",
                                  fontWeight: 500,
                                }}
                              >
                                {t(
                                  `This invitation has been ${item.inviteStatus}`
                                )}
                              </Typography.Text>
                            )}

                          {item.type === TASK_EDIT_REQUEST &&
                            item.requestStatus && (
                              <Typography.Text
                                style={{
                                  color:
                                    item.requestStatus === "Accepted"
                                      ? "#52c41a"
                                      : "#ff4d4f",
                                  fontWeight: 500,
                                }}
                              >
                                {t(
                                  `This change has been ${item.requestStatus}`
                                )}
                              </Typography.Text>
                            )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </PostLoginLayout>
  );
};

export default NotificationList;
