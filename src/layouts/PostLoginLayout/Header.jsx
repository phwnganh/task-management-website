import { Avatar, Badge, Button, message, notification, Popover } from "antd";
import { useAuth } from "../../context/useAuth";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import NotificationPopUp from "../../pages/UsersPage/Notifications/NotificationPopUp";
import { apiGetUnreadNotificationCount } from "../../services/UserService/NotificationsService";
import LanguageSwitcher from "../../locales/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { user } = useAuth();
  const { t } = useTranslation("header");
  const [visible, setVisible] = useState(false);
  const bellRef = useRef(null);
  const popoverRef = useRef(null);
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);

  useEffect(() => {
    // Center the viewport on page load, similar to the template
    document.documentElement.scrollTop = document.documentElement.clientHeight;
    document.documentElement.scrollLeft = document.documentElement.clientWidth;

    // Handle click outside to close popover
    const handleClickOutside = (e) => {
      if (
        bellRef.current &&
        popoverRef.current &&
        !bellRef.current.contains(e.target) &&
        !popoverRef.current.contains(e.target)
      ) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCountUnreadNotifications = async () => {
      try {
        const res = await apiGetUnreadNotificationCount(user.id);
        setUnreadNotiCount(res);
      } catch (error) {
        notification.error({
          message: "Error",
          description: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchCountUnreadNotifications();
  }, [user.id]);

  const handleBellClick = () => {
    setVisible((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 md:px-6 lg:pl-72 bg-white shadow-md">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            {t("hi")}, {user.first_name} {user.last_name}
          </h1>
        </div>
        <div className="flex items-center gap-12">
          {" "}
          {/* THÔNG BÁO */}
          <div>
            <Popover
              content={
                <div
                  ref={popoverRef}
                  className="max-h-[50vh] w-[300px] overflow-y-auto"
                >
                  <NotificationPopUp />
                </div>
              }
              trigger="click"
              open={visible}
              onOpenChange={setVisible}
              placement="bottomRight"
            >
              <Badge count={unreadNotiCount}>
                <Button
                  type="default"
                  icon={<BellOutlined />}
                  className="h-10 w-10 flex items-center justify-center"
                  ref={bellRef}
                />
              </Badge>
            </Popover>
          </div>
          {/* NÚT CHUYỂN ĐỔI NGÔN NGỮ */}
          <div>
            <LanguageSwitcher />
          </div>
          {/* AVATAR + TÊN */}
          <div className="flex items-center gap-2">
            <Avatar
              src={user.avatar_url}
              alt=""
              icon={!user.avatar_url && <UserOutlined />}
              className="h-8 w-8 rounded-full"
            />
            <div className="hidden md:block ml-2">
              <p className="text-sm font-medium text-gray-800">
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
