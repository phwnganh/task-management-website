import { Tabs } from "antd";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import ChangeProfile from "./components/ChangeProfile";
import ChangePassword from "./components/ChangePassword";

const Settings = () => {
  const tabItems = [
    {
      key: "change-profile",
      label: "Change Profile",
      children: <ChangeProfile />,
    },
    {
      key: "change-password",
      label: "Change Password",
      children: <ChangePassword />,
    },
  ];

  return (
    <PostLoginLayout>
      <div className="p-4 rounded-lg">
        <Tabs
          defaultActiveKey="change-profile"
          tabPosition="top"
          style={{ height: 220 }}
          size="large"
          items={tabItems}
        />
      </div>
    </PostLoginLayout>
  );
};

export default Settings;
