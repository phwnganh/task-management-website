import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Spin, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { apiGetProjectMembers } from "../../../../../services/UserService/ManageMembersInsideProjectService";

const OtherTaskListActionTool = ({projectId}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);    

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
    <div>
      <Spin
        spinning={loading}
        indicator={<LoadingOutlined spin />}
        tip="Loading..."
      >
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="flex items-center space-x-4">
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
              View Other Member's Tasks
            </h1>

          {/* <div className="flex items-center space-x-2">
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
          </div> */}
        </div>
      </div>     
      </Spin>
    </div>
  );
};

export default OtherTaskListActionTool;
