// import React, { useEffect, useState } from "react";
// import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
// import { useAuth } from "../../../context/useAuth";
// import {
//   apiChangeNotificationStatus,
//   apiCreateNotifications,
//   apiGetNotifications,
// } from "../../../services/UserService/NotificationsService";
// import {
//   Avatar,
//   Badge,
//   Button,
//   Divider,
//   List,
//   message,
//   notification,
//   Skeleton,
//   Typography,
// } from "antd";
// import InfiniteScroll from "react-infinite-scroll-component";
// import {
//   PROJECT_INVITATION,
//   TASK_EDIT_REQUEST,
//   TASK_EDIT_REQUEST_ACCEPTED,
// } from "../../../constants/notifications.constants";
// import { UserOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import {
//   apiChangeRequestContentStatus,
//   apiGetRequestToEditTaskByMember,
//   apiGetRequestToEditTaskDetail,
// } from "../../../services/UserService/ManageTasksService";
// import { v4 as uuidv4 } from "uuid";

// const NotificationList = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const { user } = useAuth();
//   const pageSize = 10;
//   const [requestedContent, setRequestedContent] = useState(null);

//   const loadMoreData = async () => {
//     if (isLoading) return;
//     setIsLoading(true);
//     try {
//       const data = await apiGetNotifications(user.id);
//       const start = (page - 1) * pageSize;
//       const end = start + pageSize;
//       setNotifications([...notifications, ...data.slice(start, end)]);
//       setPage(page + 1);
//       setIsLoading(false);
//     } catch (error) {
//       message.error(error.message);
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMoreData();
//   }, []);

//   // Hàm xử lý đánh dấu đọc/chưa đọc
//   const handleMarkReadStatus = async (notificationId, currentStatus) => {
//     try {
//       const newStatus = currentStatus === "Unread" ? "Read" : "Unread";
//       const res = await apiChangeNotificationStatus(notificationId, newStatus);
//       setNotifications((prevNotifications) =>
//         prevNotifications.map((notif) =>
//           notif.id === notificationId ? { ...notif, status: res.status } : notif
//         )
//       );
//       notification.success({
//         message: "Success",
//         description: `Notification marked as ${newStatus.toLowerCase()}`,
//         placement: "bottomRight",
//       });
//     } catch (error) {
//       notification.error({
//         message: "Error",
//         description: "Failed to update notification status",
//         placement: "bottomRight",
//       });
//     }
//   };

//   // Hàm xử lý Accept/Reject
// const handleAction = async (requestId, status) => {
//   try {
//     // Step 1: Change the request content status
//     const res = await apiChangeRequestContentStatus(requestId, status);
//     // Step 2: Create a notification after successful status change
//     await apiCreateNotifications({
//       id: uuidv4(),
//       type: TASK_EDIT_REQUEST_ACCEPTED,
//       task_id: res.task_id,
//       recipient_id: res.requester_id,
//       initiator_id: user.id,
//       message: `${user.first_name} ${user.last_name} has ${status.toLowerCase()} your proposed changes in task`,
//       created_at: new Date().toISOString()
//     });

//     // Step 3: Update notifications state (optional, if you want to reflect the new notification)
//     setNotifications((prevNotifications) =>
//       prevNotifications.map((notif) =>
//         notif.requestContent_id === requestId
//           ? { ...notif, status: "Read" } // Mark the original notification as read
//           : notif
//       )
//     );

//     // Step 4: Show success message
//     notification.success({
//       message: "Success",
//       description: `${status} the requested content successfully!`,
//       placement: "bottomRight",
//     });
//   } catch (error) {
//     // Handle errors for both API calls
//     notification.error({
//       message: "Error",
//       description: error.message || "Failed to process the request",
//       placement: "bottomRight",
//     });
//   }
// };

//   return (
//     <PostLoginLayout>
//       <div className="max-w-7xl mx-auto p-4 sm:p-5">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//           <div className="flex items-center space-x-4">
//             <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
//               All Notifications
//             </h1>
//           </div>
//         </div>
//         <div className="mt-5">
//           <InfiniteScroll
//             dataLength={notifications.length}
//             next={loadMoreData}
//             hasMore={notifications.length}
//             loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
//             endMessage={
//               <Divider className="text-gray-500">Nothing more</Divider>
//             }
//             scrollableTarget="scrollableDiv"
//           >
//             <List
//               itemLayout="horizontal"
//               dataSource={notifications}
//               renderItem={(item) => (
//                 <List.Item
//                   className="border-b py-4"
//                   key={item.id}
//                   actions={[
//                     item.status === "Unread" ? (
//                       <Button
//                         type="primary"
//                         onClick={() =>
//                           handleMarkReadStatus(item.id, item.status)
//                         }
//                         className="bg-blue-500 border-blue-500 hover:bg-blue-600"
//                       >
//                         Mark as Read
//                       </Button>
//                     ) : (
//                       <Button
//                         type="default"
//                         onClick={() =>
//                           handleMarkReadStatus(item.id, item.status)
//                         }
//                         className="text-gray-500 border-gray-500 hover:bg-gray-50"
//                       >
//                         Mark as Unread
//                       </Button>
//                     ),
//                   ]}
//                 >
//                   <List.Item.Meta
//                     avatar={
//                       <Avatar
//                         src={item?.initiator?.avatar_url}
//                         icon={!item?.initiator?.avatar_url && <UserOutlined />}
//                         className="mt-1"
//                       />
//                     }
//                     title={
//                       <div className="flex items-center gap-2">
//                         <Typography.Text className="font-semibold text-gray-800">
//                           {item?.initiator?.first_name}{" "}
//                           {item?.initiator?.last_name}
//                         </Typography.Text>
//                         {item.status === "Unread" && <Badge status="error" />}
//                       </div>
//                     }
//                     description={
//                       <div className="flex flex-col">
//                         <Typography.Text className="text-gray-600 text-start">
//                           {item.message}
//                         </Typography.Text>
//                         <Typography.Text className="text-gray-400 text-sm mt-1 text-start">
//                           at{" "}
//                           {dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}
//                         </Typography.Text>
//                         {(item.type === PROJECT_INVITATION ||
//                           item.type === TASK_EDIT_REQUEST) && (
//                           <div className="flex gap-2 mt-2">
//                             <Button
//                               type="primary"
//                               onClick={() => handleAction(item.requestContent_id, "Accepted")}
//                               className="bg-green-500 border-green-500 hover:bg-green-600"
//                             >
//                               Accept
//                             </Button>
//                             <Button
//                               type="default"
//                               onClick={() => handleAction(item.requestContent_id, "Rejected")}
//                               className="text-red-500 border-red-500 hover:bg-red-50"
//                             >
//                               Reject
//                             </Button>
//                           </div>
//                         )}
//                       </div>
//                     }
//                   />
//                 </List.Item>
//               )}
//             />
//           </InfiniteScroll>
//         </div>
//       </div>
//     </PostLoginLayout>
//   );
// };

// export default NotificationList;

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
  TASK_EDIT_REQUEST,
  TASK_EDIT_REQUEST_ACCEPTED,
  TASK_EDIT_REQUEST_REJECTED,
} from "../../../constants/notifications.constants";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  apiChangeRequestContentStatus,
  apiGetRequestToEditTaskDetail,
} from "../../../services/UserService/ManageTasksService";
import { v4 as uuidv4 } from "uuid";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const pageSize = 10;

  const loadMoreData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await apiGetNotifications(user.id);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      // Fetch request status for TASK_EDIT_REQUEST notifications
      const enrichedData = await Promise.all(
        data.slice(start, end).map(async (notification) => {
          if (notification.type === TASK_EDIT_REQUEST && notification.requestContent_id) {
            try {
              const requestDetail = await apiGetRequestToEditTaskDetail(notification.requestContent_id);
              return { ...notification, requestStatus: requestDetail.status };
            } catch (error) {
              console.error("Failed to fetch request status:", error);
              return { ...notification, requestStatus: null };
            }
          }
          return notification;
        })
      );
      setNotifications([...notifications, ...enrichedData]);
      setPage(page + 1);
      setIsLoading(false);
    } catch (error) {
      message.error(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  // Hàm xử lý đánh dấu đọc/chưa đọc
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
        message: "Success",
        description: `Notification marked as ${newStatus.toLowerCase()}`,
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update notification status",
        placement: "bottomRight",
      });
    }
  };

  // Hàm xử lý Accept/Reject
  const handleAction = async (requestId, status) => {
    try {
      // Step 1: Change the request content status
      const res = await apiChangeRequestContentStatus(requestId, status);
      // Step 2: Create a notification after successful status change
      await apiCreateNotifications({
        id: uuidv4(),
        type: status === "Accepted" ? TASK_EDIT_REQUEST_ACCEPTED : TASK_EDIT_REQUEST_REJECTED,
        task_id: res.task_id,
        recipient_id: res.requester_id,
        status: "Unread",
        initiator_id: user.id,
        message: `${user.first_name} ${user.last_name} has ${status.toLowerCase()} your proposed changes in task`,
        created_at: new Date().toISOString(),
      });


      // Step 3: Update notifications state to reflect new request status
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.requestContent_id === requestId
            ? { ...notif, requestStatus: status } // Update requestStatus and mark as read
            : notif
        )
      );

      // Step 4: Show success message
      notification.success({
        message: "Success",
        description: `${status} the requested content successfully!`,
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to process the request",
        placement: "bottomRight",
      });
    }
  };

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
              All Notifications
            </h1>
          </div>
        </div>
        <div className="mt-5">
          <InfiniteScroll
            dataLength={notifications.length}
            next={loadMoreData}
            hasMore={notifications.length}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={
              <Divider className="text-gray-500">Nothing more</Divider>
            }
            scrollableTarget="scrollableDiv"
          >
            <List
              itemLayout="horizontal"
              dataSource={notifications}
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
                        Mark as Read
                      </Button>
                    ) : (
                      <Button
                        type="default"
                        onClick={() =>
                          handleMarkReadStatus(item.id, item.status)
                        }
                        className="text-gray-500 border-gray-500 hover:bg-gray-50"
                      >
                        Mark as Unread
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item?.initiator?.avatar_url}
                        icon={!item?.initiator?.avatar_url && <UserOutlined />}
                        className="mt-1"
                      />
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <Typography.Text className="font-semibold text-gray-800">
                          {item?.initiator?.first_name}{" "}
                          {item?.initiator?.last_name}
                        </Typography.Text>
                        {item.status === "Unread" && <Badge status="error" />}
                      </div>
                    }
                    description={
                      <div className="flex flex-col">
                        <Typography.Text className="text-gray-600 text-start">
                          {item.message}
                        </Typography.Text>
                        <Typography.Text className="text-gray-400 text-sm mt-1 text-start">
                          at{" "}
                          {dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}
                        </Typography.Text>
                        {(item.type === PROJECT_INVITATION ||
                          item.type === TASK_EDIT_REQUEST) && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="primary"
                              onClick={() => handleAction(item.requestContent_id, "Accepted")}
                              className="bg-green-500 border-green-500 hover:bg-green-600"
                              disabled={item.requestStatus === "Accepted" || item.requestStatus === "Rejected"} // Disable if status is Accepted
                            >
                              Accept
                            </Button>
                            <Button
                              type="default"
                              onClick={() => handleAction(item.requestContent_id, "Rejected")}
                              className="text-red-500 border-red-500 hover:bg-red-50"
                              disabled={item.requestStatus === "Accepted" || item.requestStatus === "Rejected"} // Disable if status is Accepted
                            >
                              Reject
                            </Button>
                          </div>
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
    </PostLoginLayout>
  );
};

export default NotificationList;
