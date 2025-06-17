import { Button } from "antd";
import { useState, useContext } from "react";
import AddProjectModalDialog from "../AddProject/AddProjectModalDialog";
import { AuthContext } from "../../../../context/AuthContext";
import { useTranslation } from "react-i18next";

const ProjectsListActionTool = () => {
  const { t } = useTranslation("mp");
  const { user } = useContext(AuthContext);
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
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">Projects</h1>
        <div className="mt-2 md:mt-0">
          <Button type="primary" size="large" onClick={handleOpenModal}>
            {t("Create Project")}
          </Button>
          <AddProjectModalDialog
            visible={isModalOpen}
            onClose={handleCloseModal}
            onCreate={handleCreate}
            owner={user}
          />
        </div>
      </div>
    </>
  );
};

export default ProjectsListActionTool;
