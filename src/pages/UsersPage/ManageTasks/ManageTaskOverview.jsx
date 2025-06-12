import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { useParams } from "react-router-dom";
import TaskList from "./TaskList";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { Tabs } from "antd";
import { apiGetProjectDetail } from "../../../services/UserService/ManageProjectsService";
import OtherTaskList from "./ViewOtherMember'sTaskList/OtherTaskList";

const ManageTaskOverview = () => {
  const [activeTab, setActiveTab] = useState("task-list");
  const { user } = useAuth();
  const { projectId } = useParams();
    const [project, setProject] = useState(null);

  const allTabItems = [
    {
      key: "task-list",
      label: "View Task List",
      children: <TaskList projectId={projectId} project={project}/>,
    },
    {
      key: "task-dashboard",
      label: "View Task Dashboard"
    },
    {
      key: "member-task-list",
      label: "View Other Member's Task List",
      children: <OtherTaskList projectId={projectId}/>
    }
  ];

  const tabItems = allTabItems.filter((item) => {
    if (project?.owner_id === user?.id) {
      // If user is the project owner, exclude "member-task-list"
      return item.key !== "member-task-list";
    } else {
      // If user is not the project owner, exclude "task-dashboard"
      return item.key !== "task-dashboard";
    }
  });

    useEffect(() => {
      const fetchProjectDetail = async () => {
        try {
          const projectData = await apiGetProjectDetail(projectId);
          console.log("prject detail: ", projectData);
  
          setProject(projectData);
        } catch (error) {
          console.error("Error fetching project:", error);
        }
      };
      if (projectId) {
        fetchProjectDetail();
      }
    }, [projectId]);
  return (
    <div>
      <PostLoginLayout>
        <div className="p-4 rounded-lg">
          <Tabs
            activeKey={activeTab} // Use activeKey instead of defaultActiveKey
            onChange={setActiveTab} // Update state when tab changes
            tabPosition="top"
            style={{ height: 220 }}
            size="large"
            items={tabItems}
          />
        </div>
      </PostLoginLayout>
    </div>
  );
};

export default ManageTaskOverview;
