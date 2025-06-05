import { Button } from "antd"
import { useState } from "react";
import AddProjectForm from "../AddProject/components/AddProjectForm";
const ProjectsListActionTool = () => {
      const [modalOpen, setModalOpen] = useState(false);
      return (<>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
      <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">Projects</h1>
      <div className="mt-2 md:mt-0">
            <Button type="primary" size="large" onClick={() => setModalOpen(true)}>Create Project</Button>
            <AddProjectForm   visible={modalOpen} onClose={() => setModalOpen(false)}/>
      </div>
      </div>
      </>)
}

export default ProjectsListActionTool;