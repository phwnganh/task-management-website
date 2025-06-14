import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import ProjectOverviewDashboard from "./components/ProjectOverviewDashboard";
import UserOverviewDashboard from "./components/UserOverviewDashboard";

const AdminOverviewDashboard = () => {
  return (
    <PostLoginLayout>
      <div className=" p-4 rounded-lg">
        <UserOverviewDashboard />
        <ProjectOverviewDashboard />
      </div>
    </PostLoginLayout>
  );
};

export default AdminOverviewDashboard;
