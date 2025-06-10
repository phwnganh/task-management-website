import { Button, Modal } from "antd";
import { useState } from "react";
import CreateLabelModalDialog from "../CreateLabel/CreateLabelModalDialog";

const LabelListActionTool = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleCreate = (project) => {
    console.log("Project created:", project);
  };
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">Labels</h1>
        <div className="mt-2 md:mt-0">
          <Button type="primary" size="large" onClick={handleOpenModal}>
            Create Label
          </Button>
        </div>
        <Modal
          title={<h2 className="text-3xl font-bold">Create Label</h2>}
          width={500}
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
        >
          <CreateLabelModalDialog
            onSubmit={() => {
              if (reloadLabelList) reloadLabelList();
              handleCloseModal();
            }}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </>
  );
};

export default LabelListActionTool;
