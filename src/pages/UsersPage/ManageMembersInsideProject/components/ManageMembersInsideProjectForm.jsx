import { useEffect, useState } from "react";
import { Button, List, Avatar, Pagination, Modal, message, Select, notification } from "antd";
import { UserDeleteOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import {
  apiGetProjectMembers,
  apiGetPendingProjectMembers,
  apiProjectAddMember,
  apiRemoveProjectMember,
  searchUsersNotInProject,
} from "../../../../services/UserService/ManageMembersInsideProjectService";
import { v4 as uuidv4 } from "uuid";
import { ADMIN } from "../../../../constants/role.constants";
import { apiCreateNotifications } from "../../../../services/UserService/NotificationsService";
import { PROJECT_INVITATION } from "../../../../constants/notifications.constants";
import { useAuth } from "../../../../context/useAuth";
import dayjs from "dayjs";
import { apiGetProjectDetail } from "../../../../services/UserService/ManageProjectsService";

import { useTranslation } from "react-i18next";

const { Option } = Select;

export default function ManageMembersInsideProjectForm({
  projectId,
  onClose,
  ownerId,
}) {
  const { t } = useTranslation("taskcalendar");
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [viewPending, setViewPending] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allSearchableUsers, setAllSearchableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const {user} = useAuth()
  const [projectData, setProjectData] = useState(null)

  const getProjectDetail = async () => {
    try {
      const res = await apiGetProjectDetail(projectId)
      setProjectData(res)
    } catch (error) {
      notification.error({
        message: error.message,
        placement: "bottomRight"
      })
    }
  }

  useEffect(() => {
    getProjectDetail()
  }, [projectId])

  const membersPerPage = 5;

  useEffect(() => {
    fetchProjectMembers();
    fetchSearchableUsers();
  }, [page]);

  const fetchProjectMembers = async () => {
    setLoading(true);
    try {
      // Fetch accepted project members and filter out the Owner
      const acceptedRes = await apiGetProjectMembers(projectId);

      const accepted = acceptedRes
        .filter(
          (m) =>
            m.invite_status?.toLowerCase() === "accepted" &&
            String(m.user_id) !== String(ownerId) // Exclude the Owner
        )
        .map((m) => ({
          user_id: m.user_id,
          project_member_id: m.id,
          name: `${m.user_details?.first_name ?? ""} ${
            m.user_details?.last_name ?? ""
          }`.trim(),
          email: m.user_details?.email ?? "",
          avatar: m.user_details?.avatar_url?.trim() || null,
        }));

      // Fetch pending project members and filter out the Owner
      const pendingRes = await apiGetPendingProjectMembers(projectId);

      const pending = pendingRes
        .filter(
          (m) => String(m.user_id) !== String(ownerId) // Exclude the Owner
        )
        .map((m) => ({
          user_id: m.user_id,
          project_member_id: m.id,
          name: `${m.user_details?.first_name ?? ""} ${
            m.user_details?.last_name ?? ""
          }`.trim(),
          email: m.user_details?.email ?? "",
          avatar: m.user_details?.avatar_url?.trim() || null,
        }));

      setPendingMembers(pending);
      setTotal(accepted.length);

      const paginated = accepted.slice(
        (page - 1) * membersPerPage,
        page * membersPerPage
      );
      setMembers(paginated);
    } catch (err) {
      message.error(t("failedToLoadMembers"));
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchableUsers = async () => {
    try {
      const users = await searchUsersNotInProject(projectId);
      const filtered = users.filter(
        (user) => user.role !== ADMIN && user.id !== ownerId
      ); // Exclude Owner and Admin
      setAllSearchableUsers(filtered);
      setSearchResults(filtered);
    } catch (err) {
      message.error(t("failedToLoadSearchableUsers"));
    }
  };

  const handleSearch = (value) => {
    const query = value.trim().toLowerCase();

    if (!query) {
      setSearchResults(allSearchableUsers);
    } else {
      const filtered = allSearchableUsers.filter(
        (user) =>
          (user.first_name + " " + user.last_name)
            .toLowerCase()
            .includes(query) || user.email?.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
    }
  };

  const handleAddMember = (userData) => {
    Modal.confirm({
      title: `Add ${userData.first_name} ${userData.last_name} to project?`,
      title: `${t("add")} ${user.first_name} ${user.last_name} ${t(
        "toProject"
      )}`,
      onOk: async () => {
        try {
          const projectMemberRes = await apiProjectAddMember({
            id: uuidv4(),
            project_id: projectId,
            user_id: userData.id,
            role: "Member",
            invite_status: "Pending",
            invited_at: new Date().toISOString(),
          });

          await apiCreateNotifications({
            id: uuidv4(),
            type: PROJECT_INVITATION,
            project_id: projectId,
            recipient_id: userData.id,
            initiator_id: user.id,
            projectMember_id: projectMemberRes.id,
            message: `You have been invited to join the project '${projectData?.title}' as a Member`,
            status: "Unread",
            created_at: dayjs().toISOString()
          })
          message.success(t("memberAdded"));
          setSelectedUser(null);
          setSearchResults(allSearchableUsers);
          await fetchProjectMembers();
        } catch (err) {
          message.error(t("failedToAddMember"));
        }
      },
    });
  };

  const handleRemoveMember = (user) => {
    Modal.confirm({
      title: `${t("remove")} ${user.name} ${t("fromProject")}`,
      onOk: async () => {
        try {
          await apiRemoveProjectMember(projectId, user.project_member_id);
          message.success(t("memberRemoved"));
          fetchProjectMembers();
        } catch (err) {
          message.error(t("failedToRemoveMember"));
        }
      },
    });
  };

  const togglePendingView = () => {
    setViewPending((prev) => !prev);
  };

  const listToRender = viewPending ? pendingMembers : members;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("addMemberToProject")}</h2>

      <div className="flex items-center space-x-4">
        <Select
          showSearch
          placeholder={t("searchAndSelectUser")}
          onSearch={handleSearch}
          onChange={(value) => setSelectedUser(value)}
          value={selectedUser}
          loading={loading}
          style={{
            flex: 1,
            height: "40px",
            borderRadius: "8px",
          }}
          filterOption={false}
          notFoundContent={t("noUsersFound")}
        >
          {searchResults.map(
            (user) =>
              user.id && (
                <Option key={user.id} value={user.id}>
                  <div className="flex items-center">
                    <Avatar src={user.avatar_url || null} icon={!user.avatar_url && <UserOutlined/>}/>
                    <span className="ml-2">{`${user.first_name} ${user.last_name}`}</span>
                  </div>
                </Option>
              )
          )}
        </Select>

        {selectedUser && (
          <Button
            icon={<UserAddOutlined />}
            onClick={() =>
              handleAddMember(
                searchResults.find((user) => user.id === selectedUser)
              )
            }
            type="primary"
            style={{
              width: "100px",
              height: "40px",
              borderRadius: "8px",
              marginLeft: "16px",
            }}
          >
            {t("add")}
          </Button>
        )}
      </div>

      {/* Toggle Pending member */}
      <div>
        <span
          onClick={togglePendingView}
          className="text-blue-500 cursor-pointer text-sm"
        >
          {viewPending ? t("back") : t("viewPendingUsers")}
        </span>
      </div>

      {/* Info */}
      <div className="text-sm font-medium">
        {viewPending
          ? `${pendingMembers.length} ${t("pendingMembers")}`
          : `${total} ${t("joinedMembers")}`}
      </div>

      {/* Member List */}
      <List
        loading={loading}
        dataSource={listToRender}
        renderItem={(user) => (
          <List.Item
            actions={[
              viewPending ? (
                <span className="text-xs text-black-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                  {t("pending")}
                </span>
              ) : (
                <Button
                  danger
                  icon={<UserDeleteOutlined />}
                  onClick={() => handleRemoveMember(user)}
                >
                  {t("remove")}
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={user.avatar || null} icon={!user.avatar_url && <UserOutlined/>}/>}
              title={user.name}
              description={user.email}
            />
          </List.Item>
        )}
      />

      {/* Pagination */}
      {!viewPending && (
        <Pagination
          current={page}
          total={total}
          pageSize={membersPerPage}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      )}

      {/* Footer */}
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button type="primary" onClick={onClose}>
          {t("done")}
        </Button>
      </div>
    </div>
  );
}
