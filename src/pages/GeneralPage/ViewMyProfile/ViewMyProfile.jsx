import { Tabs } from "antd";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import MyProfile from "./components/MyProfile";
import ViewRecentlyProject from "./components/ViewRecentlyProjects";
import ViewSavedProject from "./components/ViewSavedProjects";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ViewArchievedProjects from "./components/ViewArchievedProjects";
import { useAuth } from "../../../context/useAuth";
import { ADMIN } from "../../../constants/role.constants";

const ViewMyProfile = () => {
  const { t } = useTranslation("taskcalendar");
  const [activeTab, setActiveTab] = useState("my-profile");
  const { user } = useAuth();
  const tabItems = [
    {
      key: "my-profile",
      label: t("myProfile"),
      children: <MyProfile />,
    },
    {
      key: "recently-project",
      label: t("recentlyProject"),
      children: <ViewRecentlyProject />,
    },
    {
      key: "saved-project",
      label: t("savedProject"),
      children: <ViewSavedProject />,
    },
    {
      key: "archive-project",
      label: t("Archive Projects"),
      children: <ViewArchievedProjects />,
    },
  ];

  const authorizedTabItems =
    user?.role === ADMIN
      ? tabItems.filter((tab) => tab.key === "my-profile")
      : tabItems;

  return (
    <>
      <PostLoginLayout>
        <div className="p-4 rounded-lg">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabPosition="top"
            style={{ height: 220 }}
            size="large"
            items={authorizedTabItems}
          />
        </div>
      </PostLoginLayout>
    </>
  );
};

export default ViewMyProfile;
