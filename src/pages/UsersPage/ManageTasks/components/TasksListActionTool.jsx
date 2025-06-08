import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  message,
  Modal,
  Spin,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import AddTaskModalDialog from "../AddTask/AddTaskModalDialog";
import { apiGetProjectMembers } from "../../../../services/UserService/ManageMembersInsideProjectService";

const TasksListActionTool = ({ projectId, projectData, userId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const showAddTaskModal = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleAddTaskModalCancel = () => {
    setIsAddTaskModalOpen(false);
  };

  const handleAddTaskModalOk = () => {
    setIsAddTaskModalOpen(true);
  };
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const projectMembers = await apiGetProjectMembers(projectId);
        setMembers(projectMembers);
      } catch (error) {
        message.error("Error fetching project members");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  // Filter out the owner from the members list
  const nonOwnerMembers = members.filter((member) => !member.is_owner);
  const displayedMembers = nonOwnerMembers.slice(0, 3);
  const remainingMembers = nonOwnerMembers.slice(3);

  // Create dropdown menu for remaining members
  const menuItems = remainingMembers.map((member) => ({
    key: member.user_id,
    label: (
      <div className="flex items-center">
        <Avatar
          src={member.user_details.avatar_url}
          icon={!member.user_details.avatar_url && <UserOutlined />}
          alt={`${member.user_details.first_name} ${member.user_details.last_name}`}
          className="w-8 h-8 rounded-full mr-2"
        />
        <span>{`${member.user_details.first_name} ${member.user_details.last_name}`}</span>
      </div>
    ),
  }));
  return (
    <Spin
      spinning={loading}
      indicator={<LoadingOutlined spin />}
      tip="Loading..."
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="flex items-center space-x-4">
          {projectData && projectData.owner_id === userId ? (
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
              Tasks
            </h1>
          ) : (
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
              My Tasks
            </h1>
          )}

          <div className="flex items-center space-x-2">
            {displayedMembers.map((member) => (
              <div key={member.user_id} className="flex flex-col items-center">
                <Tooltip
                  title={`${member.user_details.first_name} ${member.user_details.last_name}`}
                >
                  <Avatar
                    src={member.user_details.avatar_url}
                    icon={!member.user_details.avatar_url && <UserOutlined />}
                    alt={`${member.user_details.first_name} ${member.user_details.last_name}`}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                </Tooltip>
                {/* <span className="text-sm mt-1">{`${member.user_details.first_name} ${member.user_details.last_name}`}</span> */}
              </div>
            ))}
            {remainingMembers.length > 0 && (
              <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                <Button
                  shape="circle"
                  className="flex items-center justify-center w-10 h-10"
                >
                  +{remainingMembers.length}
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
        {projectData && projectData.owner_id === userId && (
          <div className="mt-2 md:mt-0">
            <Button
              type="primary"
              size="large"
              onClick={() => showAddTaskModal()}
            >
              Create Task
            </Button>
          </div>
        )}
      </div>
      <Modal
        title={"Create Task"}
        width={750}
        open={isAddTaskModalOpen}
        onCancel={handleAddTaskModalCancel}
        footer={[
          <Button key={"reset"} onClick={handleAddTaskModalCancel}>
            Reset
          </Button>,
          <Button key={"create"} onClick={handleAddTaskModalOk} type="primary">
            Create
          </Button>,
        ]}
      >
        <AddTaskModalDialog />
      </Modal>
    </Spin>
  );
};

export default TasksListActionTool;
