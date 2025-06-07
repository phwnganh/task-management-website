
import { Modal } from 'antd';
import AddProjectForm from './components/AddProjectForm';

const AddProjectModalDialog = ({ visible, onClose, onCreate, owner }) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <AddProjectForm owner={owner} onCreate={onCreate} onClose={onClose} />
    </Modal>
  );
};

export default AddProjectModalDialog;
