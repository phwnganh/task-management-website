import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { apiGetProjectDetail } from "../../../../services/UserService/ManageProjectsService";
import { useTranslation } from "react-i18next";
import { apiGetUserDetail } from "../../../../services/AdminService/ManageUsersService";
import { notification } from "antd";
import { useAuth } from "../../../../context/useAuth";
// TODO: Update the path for apiViewProjectDetail based on your project structure

const ProjectDetailModalDialog = ({ projectId }) => {
  const [projectDetail, setProjectDetail] = useState(null);
  const { t } = useTranslation("taskowner");
  const [ownerName, setOwnerName] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!projectId) return;
      try {
        const response = await apiGetProjectDetail(projectId);
        setProjectDetail(response);
      } catch (error) {
        console.error("Error fetching project detail:", error);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  useEffect(() => {
    const getOwnerDetail = async () => {
      if (!projectDetail?.owner_id) return;
      try {
        const user = await apiGetUserDetail(projectDetail.owner_id);
        setOwnerName(`${user?.first_name} ${user?.last_name}`); // Gộp first_name và last_name
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };

    getOwnerDetail();
  }, [projectDetail?.owner_id]);

  const displayName =
    projectDetail?.owner_id === user?.id ? t("Me") : ownerName;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px", textAlign: "left" }}>
        <strong style={{ color: "#1890ff" }}>{t("title")}:</strong>
        <span style={{ color: "#262626", marginLeft: "8px" }}>
          {projectDetail?.title}
        </span>
      </div>
      <div style={{ marginBottom: "20px", textAlign: "left" }}>
        <strong style={{ color: "#1890ff" }}>{t("description")}:</strong>
        <span style={{ color: "#595959", marginLeft: "8px" }}>
          {projectDetail?.description}
        </span>
      </div>
      <div style={{ marginBottom: "20px", textAlign: "left" }}>
        <strong style={{ color: "#1890ff" }}>{t("Owner Name")}:</strong>
        <span style={{ color: "#595959", marginLeft: "8px" }}>
          {displayName}
        </span>
      </div>
    </div>
  );
};

ProjectDetailModalDialog.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default ProjectDetailModalDialog;
