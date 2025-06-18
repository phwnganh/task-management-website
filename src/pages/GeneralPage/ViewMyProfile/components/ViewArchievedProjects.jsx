import React, { useEffect, useState } from "react";
import {
  apiFetchArchievedProjects,
  apiRestoreProjects,
} from "../../../../services/UserService/ManageProjectsService";
import { Avatar, Button, List, Modal, notification } from "antd";
import { UndoOutlined } from "@ant-design/icons";

const ViewArchievedProjects = () => {
  const [archievedProjects, setArchievedProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  useEffect(() => {
    const fetchArchievedProjects = async () => {
      try {
        const res = await apiFetchArchievedProjects();
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
      const res = await apiRestoreProjects(selectedProjectId);
      notification.success({
        message: "Restore projects successfully!",
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: "Failed to Restore Projects!",
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

  return (
    <div>
      <List
        pagination={{ position: "bottom", align: "center", pageSize: 5 }}
        dataSource={archievedProjects}
        renderItem={(item, index) => (
          <List.Item
            extra={
              <Button
                type="text"
                icon={<UndoOutlined />}
                onClick={() => showConfirmModal(item.id)}
                title="Restore project"
              />
            }
          >
            <List.Item.Meta
              title={<a href="#">{item.title}</a>}
              description={item.description || "No description available"}
            />
          </List.Item>
        )}
      />
      <Modal
        title="Confirm Restore"
        open={isModalVisible}
        onOk={handleRestoreProject}
        onCancel={handleCancel}
        okText="Restore"
        cancelText="Cancel"
      >
        <p>Are you sure you want to restore this project?</p>
      </Modal>
    </div>
  );
};

export default ViewArchievedProjects;
