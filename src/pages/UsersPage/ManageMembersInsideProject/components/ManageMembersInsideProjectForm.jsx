import { useEffect, useState } from "react";
import {
  Input,
  Button,
  List,
  Avatar,
  Pagination,
  Modal,
  message,
  notification, Select
} from "antd";
import {
  SearchOutlined,
  UserDeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  apiGetProjectMembers,
  apiProjectAddMember,
  apiRemoveProjectMember,
  searchUsersNotInProject,
} from "../../../../services/UserService/ManageMembersInsideProjectService";

export default function ManageMembersInsideProjectForm({ projectId, onClose, ownerId }) {
  const [members, setMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = async () => {
  if (!searchTerm) return;

  try {
    const users = await searchUsersNotInProject(projectId);
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
      notification.warning({
        message: "No Users Found",
        description: "No users matched your search.",
        placement: "topRight",
      });
    }

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
          setSearchTerm("");
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
          console.log("Removing member ID:", user.project_member_id);
          await apiRemoveProjectMember(projectId, user.project_member_id); 
          message.success("Member removed");

          // Re-fetch updated list
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
          setPage(1);
          setMembers(acceptedMembers.slice(0, membersPerPage));
        } catch (err) {
          message.error("Failed to remove member");
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add Member To The Project</h2>

      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onPressEnter={handleSearch}
        suffix={
          <Button icon={<SearchOutlined />} onClick={handleSearch} type="text" />
        }
      />

      {searchResults.length > 0 && (
        <List
          size="small"
          className="border rounded p-2"
          dataSource={searchResults}
          renderItem={(user) => (
            <List.Item
              actions={[
                <Button
                  icon={<UserAddOutlined />}
                  size="small"
                  onClick={() => handleAddMember(user)}
                >
                  Add
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
      )}

      <div className="text-sm font-medium">
        {total} member{total !== 1 ? "s" : ""} joined in this project
      </div>

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
