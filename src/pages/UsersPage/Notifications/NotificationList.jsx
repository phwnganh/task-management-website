import React, { useEffect, useState } from "react";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { useAuth } from "../../../context/useAuth";
import {
  apiChangeNotificationStatus,
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
} from "../../../constants/notifications.constants";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

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
      setNotifications([...notifications, ...data.slice(start, end)]);
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
  const handleAction = async (notificationId, action) => {
    try {
      await fetch(`${API.NOTIFICATION_URI}/${notificationId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications(
        notifications.filter((notif) => notif.id !== notificationId)
      );
      notification.success({
        message: "Success",
        description: `Notification ${action} successfully`,
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: `Failed to ${action} notification`,
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
                              onClick={() => handleAction(item.id, "accept")}
                              className="bg-green-500 border-green-500 hover:bg-green-600"
                            >
                              Accept
                            </Button>
                            <Button
                              type="default"
                              onClick={() => handleAction(item.id, "reject")}
                              className="text-red-500 border-red-500 hover:bg-red-50"
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
