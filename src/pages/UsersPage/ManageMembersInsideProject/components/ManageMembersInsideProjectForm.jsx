import { useEffect, useState } from "react";
import {
  Button,
  List,
  Avatar,
  Pagination,
  Modal,
  message,
  notification,
  Select,
} from "antd";
import {
  UserDeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  apiGetProjectMembers,
  apiProjectAddMember,
  apiRemoveProjectMember,
  searchUsersNotInProject,
} from "../../../../services/UserService/ManageMembersInsideProjectService";

const { Option } = Select;

export default function ManageMembersInsideProjectForm({
  projectId,
  onClose,
  ownerId,
}) {
  const [members, setMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const membersPerPage = 5;

  useEffect(() => {
    fetchProjectMembers();
  }, [page]);

  const fetchProjectMembers = async () => {
    setLoading(true);
    try {
      const res = await apiGetProjectMembers(projectId);

      const acceptedMembers = res
        .filter(
          (m) =>
            m.invite_status === "Accepted" &&
            String(m.user_id) !== String(ownerId)
        )
        .map((m) => ({
          user_id: m.user_id,
          project_member_id: m.id,
          name: `${m.user_details?.first_name ?? ""} ${m.user_details?.last_name ?? ""}`.trim(),
          email: m.user_details?.email ?? "",
          avatar: m.user_details?.avatar_url?.trim() || null,
        }));

      setTotal(acceptedMembers.length);
      const paginated = acceptedMembers.slice(
        (page - 1) * membersPerPage,
        page * membersPerPage
      );
      setMembers(paginated);
    } catch (err) {
      message.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    if (!value) return;

    try {
      
      const users = await searchUsersNotInProject(projectId);

      
      const filtered = users.filter(
        (user) =>
          (user.first_name + " " + user.last_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          user.email?.toLowerCase().includes(value.toLowerCase())
      ).filter(user => user.role !== 'Admin'); 

      // if (filtered.length === 0) {
      //   notification.warning({
      //     message: "No Users Found",
      //     description: "No users matched your search.",
      //     placement: "topRight",
      //   });
      // }

      setSearchResults(filtered); 
    } catch (err) {
      message.error("Search failed");
    }
  };

  const handleAddMember = (user) => {
    Modal.confirm({
      title: `Add ${user.first_name} ${user.last_name} to project?`,
      onOk: async () => {
        try {
          await apiProjectAddMember(projectId, user.id);
          message.success("Member added (Pending)");
          setSelectedUser(null);
          setSearchResults([]);
          setPage(1);
        } catch (err) {
          message.error("Failed to add member");
        }
      },
    });
  };

  const handleRemoveMember = (user) => {
    Modal.confirm({
      title: `Remove ${user.name} from project?`,
      onOk: async () => {
        try {
          await apiRemoveProjectMember(projectId, user.project_member_id);
          message.success("Member removed");

          
          fetchProjectMembers();
        } catch (err) {
          message.error("Failed to remove member");
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add Member To The Project</h2>

      
      <div className="flex items-center space-x-4">
        <Select
          showSearch
          placeholder="Search and select a user"
          onSearch={handleSearch}
          onChange={(value) => setSelectedUser(value)}
          value={selectedUser}
          loading={loading}
          style={{
            flex: 1, 
            height: '40px', 
            borderRadius: '8px', 
          }}
          filterOption={false}
          notFoundContent="No users found"
        >
          {searchResults.map((user) => (
            user.id && (
              <Option key={user.id} value={user.id}>
                <div className="flex items-center">
                  <Avatar src={user.avatar || null} />
                  <span className="ml-2">{`${user.first_name} ${user.last_name}`}</span>
                </div>
              </Option>
            )
          ))}
        </Select>

        
        {selectedUser && (
          <Button
            icon={<UserAddOutlined />}
            onClick={() => handleAddMember(searchResults.find((user) => user.id === selectedUser))}
            type="primary"
            style={{
              width: '100px', 
              height: '40px', 
              borderRadius: '8px', 
              marginLeft: '16px',
            }}
          >
            Add
          </Button>
        )}
      </div>

      <div className="text-sm font-medium">
        {total} member{total !== 1 ? "s" : ""} joined in this project
      </div>

      {/* List of Members */}
      <List
        loading={loading}
        dataSource={members}
        renderItem={(user) => (
          <List.Item
            actions={[
              <Button
                danger
                icon={<UserDeleteOutlined />}
                onClick={() => handleRemoveMember(user)}
              >
                Remove
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={user.avatar || null} />}
              title={user.name}
              description={user.email}
            />
          </List.Item>
        )}
      />

      <Pagination
        current={page}
        total={total}
        pageSize={membersPerPage}
        onChange={(p) => setPage(p)}
        showSizeChanger={false}
      />

      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}


