import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { useParams } from "react-router-dom";
import TaskList from "./TaskList";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { Tabs } from "antd";
import TaskDashboard from "./TaskDashboard/TaskDashboard";
import OtherTaskList from "./ViewOtherMember'sTaskList/OtherTaskList";
import { apiGetProjectDetail } from "../../../services/UserService/ManageProjectsService";
import { useTranslation } from "react-i18next";
import ArchivedTaskDashboard from "./ArchivedTaskDashboard/ArchivedTaskDashboard";

const ManageTaskOverview = () => {
  const { t } = useTranslation("taskcalendar");
  const [activeTab, setActiveTab] = useState("task-list");
  const { user } = useAuth();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  // Fetch project detail
  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!projectId) return;
      try {
        const data = await apiGetProjectDetail(projectId);
        setProject(data);
      } catch (err) {
        setProject(null);
        // Có thể alert hoặc notification ở đây nếu muốn
      }
    };
    fetchProjectDetail();
  }, [projectId]);

  // Tabs config
  const allTabItems = [
    {
      key: "task-list",
      label: t("viewtasklist"),
      children: <TaskList projectId={projectId} project={project} />,
    },
    {
      key: "task-dashboard",
      label: t("viewtaskdashboard"),
      children: <TaskDashboard projectId={projectId} />,
    },
    {
      key: "member-task-list",
      label: t("vw"),
      children: <OtherTaskList projectId={projectId} />,
    },
    {
      key: "archived-task-dashbboard",
      label: "Archived Task Dashboard",
      children: <ArchivedTaskDashboard/>
    }
  ];

  // Chỉ chủ project mới xem được Dashboard, thành viên thì xem MemberTaskList
  const tabItems = allTabItems.filter((item) => {
    if (project?.owner_id === user?.id) {
      // Là chủ project: bỏ tab "member-task-list"
      return item.key !== "member-task-list";
    } else {
      // Là member: bỏ tab "task-dashboard"
      return item.key !== "task-dashboard"  && item.key !== "archived-task-dashbboard";
    }
  });

  return (
    <PostLoginLayout>
      <div className="p-4 rounded-lg">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="top"
          size="large"
          items={tabItems}
        />
      </div>
    </PostLoginLayout>
  );
};

export default ManageTaskOverview;
