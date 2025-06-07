import { Button, Dropdown, Input, Modal } from "antd";
import { useState } from "react";
import TasksFilterActionModalDialog from "./TasksFilterActionModalDialog";

const TasksListTableTool = ({ projectId, onFilter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterData, setFilterData] = useState({
    priority: null,
    status: null,
    start_date: null,
    due_date: null,
    assignee: null,
  });
  const [formInstance, setFormInstance] = useState(null);
  const showFilterModal = () => {
    setIsModalOpen(true);
  };

  const handleFilterOk = () => {
    setIsModalOpen(false);
    console.log("Applying filters:", filterData);
    onFilter(filterData);
  };

  const handleFilterCancel = () => {
    setIsModalOpen(false);
  };

  const handleReset = () => {
    if (formInstance) {
      formInstance.resetFields();
    }
    setFilterData({
      priority: null,
      status: null,
      start_date: null,
      due_date: null,
      assignee: null,
    });
    onFilter({
      priority: null,
      status: null,
      start_date: null,
      due_date: null,
      assignee: null,
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-end items-start gap-4">
        <div className="flex flex-row gap-2 md:gap-4">
          <Button type="primary" size="large" onClick={showFilterModal}>
            Filter
          </Button>
          <Modal
            title="Filter Tasks"
            width={750}
            open={isModalOpen}
            onOk={handleFilterOk}
            onCancel={handleFilterCancel}
            footer={[
              <Button key={"reset"} onClick={handleReset}>Reset</Button>,
              <Button key={"submit"} type="primary" onClick={handleFilterOk}>
                Apply
              </Button>,
            ]}
          >
            <TasksFilterActionModalDialog projectId={projectId} onChange={setFilterData} onFormInstance={setFormInstance}/>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default TasksListTableTool;
