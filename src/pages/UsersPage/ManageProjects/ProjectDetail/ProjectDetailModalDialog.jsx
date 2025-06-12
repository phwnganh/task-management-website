import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// TODO: Update the path for apiViewProjectDetail based on your project structure
import { apiGetProjectDetail } from '../../../../services/UserService/UserService';

const ProjectDetailModalDialog = ({ projectId }) => {
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
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '10px', textAlign: 'left' }}>
        <strong style={{ color: '#1890ff' }}>Title:</strong>
        <span style={{ color: '#262626', marginLeft: '8px' }}>{projectDetail?.title}</span>
      </div>
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <strong style={{ color: '#1890ff' }}>Description:</strong>
        <span style={{ color: '#595959', marginLeft: '8px' }}>{projectDetail?.description}</span>
      </div>
    </div>
  );
};

ProjectDetailModalDialog.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default ProjectDetailModalDialog;

