import { useEffect, useState } from "react";
import TaskDetailAttachmentsSection from "./components/TaskDetailAttachmentsSection";
import TaskDetailCommentsSection from "./components/TaskDetailCommentsSection";
import TaskDetailInformationSection from "./components/TaskDetailInformationSection";
import { Spin, Tabs } from "antd";
import { apiGetProjectDetail } from "../../../../services/UserService/ManageProjectsService";
import { LoadingOutlined } from "@ant-design/icons";

const ViewTaskDetailModalDialog = ({ task, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("task-comment");

  const tabItems = [
    {
      key: "task-comment",
      label: "Comment",
      children: (
        <TaskDetailCommentsSection taskId={task?.id} userId={currentUser?.id} projectId={task?.project_id}/>
      ),
    },
    {
      key: "task-attachment",
      label: "Attachment",
      children: (
        <TaskDetailAttachmentsSection projectData={project} taskId={task.id} />
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!task || !currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const projectData = await apiGetProjectDetail(task.project_id);
        setProject(projectData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [task, currentUser]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Spin spinning={loading} indicator={<LoadingOutlined spin/>} tip={"Loading task details..."}>
      <div className="p-4 rounded-lg">
        <TaskDetailInformationSection task={task} currentUser={currentUser} />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="top"
          // style={{ height: 220 }}
          size="large"
          items={tabItems}
        />
      </div>
    </Spin>
  );
};

export default ViewTaskDetailModalDialog;
