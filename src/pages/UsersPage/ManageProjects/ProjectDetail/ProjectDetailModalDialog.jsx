import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
// TODO: Update the path for apiViewProjectDetail based on your project structure
import { apiGetProjectDetail } from '../../../../services/UserService/UserService';

const ProjectDetailModalDialog = ({ projectId, isOpen, onClose }) => {
  const [projectDetail, setProjectDetail] = useState(null);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!projectId) return;
      try {
        const response = await apiGetProjectDetail(projectId);
        setProjectDetail(response);
      } catch (error) {
        console.error('Error fetching project detail:', error);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  return (
    <Modal
      title="Project Detail"
      width={750}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <div style={{
        backgroundColor: '#D9D9D9',
        padding: '20px',
        borderRadius: '8px',
        width: 'fit-content',
        margin: 'auto'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Title:</strong> {projectDetail?.title}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <strong>Description:</strong> {projectDetail?.description}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectDetailModalDialog;

