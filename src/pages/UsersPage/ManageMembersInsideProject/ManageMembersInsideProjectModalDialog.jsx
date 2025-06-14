import { Modal } from "antd";
import ManageMembersInsideProjectForm from "./components/ManageMembersInsideProjectForm";

function ManageMembersInsideProjectModalDialog({ open, onClose, projectId, ownerId }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={750}
      centered
    >
      <ManageMembersInsideProjectForm
        projectId={projectId}
        ownerId={ownerId} 
        onClose={onClose}
      />
    </Modal>
  );
}

export default ManageMembersInsideProjectModalDialog;
