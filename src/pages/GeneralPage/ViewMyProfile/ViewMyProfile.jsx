import { Tabs } from "antd";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import MyProfile from "./components/MyProfile";
import ViewRecentlyProject from "./components/ViewRecentlyProjects";
import ViewSavedProject from "./components/ViewSavedProjects";

const ViewMyProfile = () => {
  const tabItems = [
    {
      key: "my-profile",
      label: "My Profile",
      children: <MyProfile />,
    },
    {
      key: "recently-project",
      label: "Recently Project",
      children: <ViewRecentlyProject />,
    },
    {
      key: "saved-project",
      label: "Saved Project",
      children: <ViewSavedProject />,
    },
  ];
  return (
    <>
      <PostLoginLayout>
        <div className=" p-4 rounded-lg">
          <Tabs
            defaultActiveKey="my-profile"
            tabPosition="top"
            style={{ height: 220 }}
            size="large"
            items={tabItems}
          />
        </div>
      </PostLoginLayout>
    </>
  );
};

export default ViewMyProfile;
