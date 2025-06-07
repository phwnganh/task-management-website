import { useState } from "react";
import MyTaskFilterActionModalDialog from "./MyTaskFilterActionModalDialog";
import { Button, Modal } from "antd";

const MyTaskListTableTool = ({ onMyFilter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myFilterData, setMyFilterData] = useState({
    priority: null,
    status: null,
    start_date: null,
    due_date: null,
  });
  const [formInstance, setFormInstance] = useState(null);
  const showMyFilterModal = () => {
    setIsModalOpen(true);
  };

  const handleMyFilterOk = () => {
    setIsModalOpen(false);
    onMyFilter(myFilterData);
  };

  const handleMyFilterCancel = () => {
    setIsModalOpen(false);
  };

  const handleReset = () => {
    if (formInstance) {
      formInstance.resetFields();
    }
    setMyFilterData({
      priority: null,
      status: null,
      start_date: null,
      due_date: null,
    });
    onMyFilter({
      priority: null,
      status: null,
      start_date: null,
      due_date: null,
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-end items-start gap-4">
        <div className="flex flex-row gap-2 md:gap-4">
          <Button type="primary" size="large" onClick={showMyFilterModal}>
            Filter
          </Button>
          <Modal
            title="Filter My Task"
            width={750}
            open={isModalOpen}
            onOk={handleMyFilterOk}
            onCancel={handleMyFilterCancel}
            footer={[
              <Button key={"reset"} onClick={handleReset}>
                Reset
              </Button>,
              <Button key={"submit"} type="primary" onClick={handleMyFilterOk}>
                Apply
              </Button>,
            ]}
          >
            <MyTaskFilterActionModalDialog
              onChange={setMyFilterData}
              onFormInstance={setFormInstance}
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

export default MyTaskListTableTool
