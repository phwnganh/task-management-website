import { useEffect, useState } from "react";
import TaskDetailAttachmentsSection from "./components/TaskDetailAttachmentsSection";
import TaskDetailCommentsSection from "./components/TaskDetailCommentsSection";
import TaskDetailInformationSection from "./components/TaskDetailInformationSection";
import { Tabs } from "antd";
import { apiGetProjectDetail } from "../../../../services/UserService/ManageProjectsService";

const ViewTaskDetailModalDialog = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState("task-comment");
    const [project, setProject] = useState(null);

  const tabItems = [
    {
      key: "task-comment",
      label: "Comment",
      children: <TaskDetailCommentsSection />,
    },
    {
      key: "task-attachment",
      label: "Attachment",
      children: <TaskDetailAttachmentsSection projectData={project}/>,
    },
  ];
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
    <>
      <div className="p-4 rounded-lg">
        <TaskDetailInformationSection />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="top"
          style={{ height: 220 }}
          size="large"
          items={tabItems}
        />
      </div>
    </>
  );
};

export default ViewTaskDetailModalDialog;
