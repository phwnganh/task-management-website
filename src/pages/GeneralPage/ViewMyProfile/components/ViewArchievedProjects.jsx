import React, { useEffect, useState } from "react";
import {
  apiFetchArchievedProjects,
  apiRestoreProjects,
} from "../../../../services/UserService/ManageProjectsService";
import { Avatar, Button, List, Modal, notification } from "antd";
import { UndoOutlined } from "@ant-design/icons";
import { API } from "../../../../constants/api.constants";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { TbEye } from "react-icons/tb";
import ProjectDetailModalDialog from "../../../UsersPage/ManageProjects/ProjectDetail/ProjectDetailModalDialog";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../context/useAuth";
import dayjs from "dayjs";

const ViewArchievedProjects = () => {
  const { t } = useTranslation("taskcalendar"); // Changed from "mp" to "taskcalendar"
  const [archievedProjects, setArchievedProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] =
    useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const fetchArchievedProjects = async () => {
      try {
        const res = await apiFetchArchievedProjects(user.id);
        setArchievedProjects(res);
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchArchievedProjects();
  }, []);

  const showConfirmModal = (projectId) => {
    setSelectedProjectId(projectId);
    setIsModalVisible(true);
  };

  const handleRestoreProject = async () => {
    try {
      const res = await apiRestoreProjects(selectedProjectId, false);
      notification.success({
        message: t("restoreSuccess"),
        placement: "bottomRight",
      });
      setArchievedProjects(
        archievedProjects.filter((p) => p.id !== selectedProjectId)
      );
    } catch (error) {
      notification.error({
        message: t("restoreFailed"),
        placement: "bottomRight",
      });
    } finally {
      setIsModalVisible(false);
      setSelectedProjectId(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedProjectId(null);
  };

  const showProjectDetailModal = (projectId) => {
    setSelectedProjectId(projectId);
    setIsProjectDetailModalOpen(true);
  };

  const handleProjectDetailCancel = () => {
    setIsProjectDetailModalOpen(false);
    setSelectedProjectId(null);
  };

  const formatArchiveDate = (archived_at) => {
    if (!archived_at) return "";
    return dayjs(archived_at).format("YYYY-MM-DD HH:mm");
  };

  return (
    <div>
      <List
        pagination={{ position: "bottom", align: "center", pageSize: 5 }}
        dataSource={archievedProjects}
        renderItem={(item, index) => (
          <List.Item
            extra={
              <div className="flex flex-row">
                <Button
                  icon={<TbEye />}
                  onClick={() => showProjectDetailModal(item.id)}
                />
                <Button
                  type="text"
                  icon={<UndoOutlined />}
                  onClick={() => showConfirmModal(item.id)}
                  title={t("restore")}
                />
              </div>
            }
          >
            <List.Item.Meta
              title={
                <a
                  href={`${PROJECT_LIST}/${item.id}`}
                  style={{ fontWeight: "bold" }}
                >
                  {item.title}
                </a>
              }
              description={
                <div>
                  <div>{item.description || "No description available"}</div>
                  {item.archived_at && (
                    <div
                      style={{
                        color: "#888",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Archived at: {formatArchiveDate(item.archived_at)}
                    </div>
                  )}
                </div>
              }
              style={{ textAlign: "left" }}
            />
          </List.Item>
        )}
      />
      <Modal
        title={t("confirmRestore")}
        open={isModalVisible}
        onOk={handleRestoreProject}
        onCancel={handleCancel}
        okText={t("restore")}
        cancelText={t("cancel")}
      >
        <p>{t("restoreConfirm")}</p>
      </Modal>
      <Modal
        title={
          <div
            style={{
              paddingBottom: "10px",
              borderBottom: "3px solid #1890ff",
              fontWeight: "bold",
            }}
          >
            {t("projectDetail")}
          </div>
        }
        width={750}
        open={isProjectDetailModalOpen}
        onCancel={handleProjectDetailCancel}
        footer={[
          <Button key="close" onClick={handleProjectDetailCancel}>
            {t("close")}
          </Button>,
        ]}
      >
        <ProjectDetailModalDialog projectId={selectedProjectId} />
      </Modal>
    </div>
  );
};

export default ViewArchievedProjects;
