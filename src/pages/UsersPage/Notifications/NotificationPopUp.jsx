import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { apiGetNotifications } from "../../../services/UserService/NotificationsService";
import { Avatar, Badge, List, message } from "antd";
import { Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
const NotificationPopUp = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await apiGetNotifications(user.id);
        setNotifications(data);
        setIsLoading(false);
      } catch (error) {
        message.error(error.message);
      }
    };
    fetchNotifications();
  }, []);
  return (
    <div className="max-w-2xl mx-auto p-5">
      <Typography.Title className="font-bold mb-4">
        Notifications
      </Typography.Title>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        loading={isLoading}
        renderItem={(item) => (
          <List.Item className="border-b py-4">
            <List.Item.Meta
              avatar={
                <Avatar
                  src={item?.initiator?.avatar_url}
                  icon={!item?.initiator?.avatar_url && <UserOutlined />}
                  className="mt-1"
                />
              }
              title={
                <div className="flex items-center space-x-2">
                  <Typography.Text strong className="text-gray-800">
                    {item.relatedData.projectTitle}
                  </Typography.Text>
                  {item.status === "Unread" && (
                    <Badge
                    status="error"
                    />
                  )}
                </div>
              }
              description={
                <div className="flex flex-col">
                  <Typography.Text className="text-gray-600">
                    {item.message}
                  </Typography.Text>
                  <Typography.Text className="text-gray-400 text-sm mt-1">
                    {dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}
                  </Typography.Text>
                </div>
              }
            />
          </List.Item>
        )}
      ></List>
    </div>
  );
};

export default NotificationPopUp;
