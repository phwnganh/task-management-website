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
    <div className="max-w-3xl mx-auto p-2 sm:p-4">
      <List
        pagination={{ position: "bottom", align: "center", pageSize: 5 }}
        dataSource={archievedProjects}
        renderItem={(item, index) => (
          <List.Item
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 border-b"
            extra={
              <div className="flex flex-row gap-2">
                <Button
                  icon={<TbEye />}
                  onClick={() => showProjectDetailModal(item.id)}
                  className="mb-2 sm:mb-0"
                />
                <Button
                  type="text"
                  icon={<UndoOutlined />}
                  onClick={() => showConfirmModal(item.id)}
                  title={t("restore")}
                  className="mb-2 sm:mb-0"
                />
              </div>
            }
          >
            <List.Item.Meta
              title={
                <a
                  href={`${PROJECT_LIST}/${item.id}`}
                  style={{ fontWeight: "bold" }}
                  className="block text-base sm:text-lg md:text-xl truncate"
                >
                  {item.title}
                </a>
              }
              description={
                <div className="text-sm sm:text-base">
                  <div>{item.description || "No description available"}</div>
                  {item.archived_at && (
                    <div
                      className="text-gray-500 text-xs mt-1"
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
        className="max-w-xs sm:max-w-md md:max-w-lg"
      >
        <p>{t("restoreConfirm")}</p>
      </Modal>
      <Modal
        title={
          <div
            className="pb-2 border-b-2 border-blue-500 font-bold text-lg sm:text-xl"
          >
            {t("projectDetail")}
          </div>
        }
        width={750}
        open={isProjectDetailModalOpen}
        onCancel={handleProjectDetailCancel}
        footer={[
          <Button key="close" onClick={handleProjectDetailCancel} className="w-full md:w-auto mx-auto block">
            {t("close")}
          </Button>,
        ]}
        className="max-w-xs sm:max-w-lg md:max-w-2xl"
      >
        <ProjectDetailModalDialog projectId={selectedProjectId} />
      </Modal>
    </div>
  );
};

export default ViewArchievedProjects;
