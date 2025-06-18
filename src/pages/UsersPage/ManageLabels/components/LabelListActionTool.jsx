import { Button, Modal } from "antd";
import { useState } from "react";
import CreateLabelModalDialog from "../CreateLabel/CreateLabelModalDialog";
import { useTranslation } from "react-i18next";

const LabelListActionTool = () => {
  const { t } = useTranslation("labellist");
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
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
          {t("labels")}
        </h1>
        <div className="mt-2 md:mt-0">
          <Button type="primary" size="large" onClick={handleOpenModal}>
            {t("create_label")}
          </Button>
        </div>
        <Modal
          title={<h2 className="text-3xl font-bold">{t("create_label")}</h2>}
          width={550}
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
