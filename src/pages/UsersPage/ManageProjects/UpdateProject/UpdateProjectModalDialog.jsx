import { Modal } from 'antd';
import UpdateProjectForm from './components/UpdateProjectForm';

const UpdateProjectModalDialog = ({ open, onClose, onUpdate, owner, project }) => {
   return (
   <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      
    >
      {project ? (
        <UpdateProjectForm
          owner={owner}
          project={project}
          onUpdate={onUpdate}
          onClose={onClose}
        />
      ) : (
        <div className="text-center text-gray-400">Loading project...</div>
      )}
    </Modal>
  );
};

export default UpdateProjectModalDialog;
