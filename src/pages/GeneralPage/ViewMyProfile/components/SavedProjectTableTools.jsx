import { Button, Dropdown, Input, Modal } from "antd";
import { useState } from "react";
import SavedProjectFilterAction from "./SavedProjectFilterAction";

const SavedProjectTableTools = ({ onSearch, onSort, onFilter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterData, setFilterData] = useState({
    role: null,
    projectStatus: null,
  });
  const [formInstance, setFormInstance] = useState(null);
  const items = [
    {
      key: "all",
      label: "All",
      onClick: () => onSort(null, null), // Reset sorting
    },
    {
      key: "a-z",
      label: "A-Z",
      onClick: () => onSort("title", "asc"),
    },
    {
      key: "z-a",
      label: "Z-A",
      onClick: () => onSort("title", "desc"),
    },
    {
      key: "latest",
      label: "Latest",
      onClick: () => onSort("created_at", "desc"),
    },
    {
      key: "oldest",
      label: "Oldest",
      onClick: () => onSort("created_at", "asc"),
    },
  ];

  const showFilterModal = () => {
    setIsModalOpen(true);
  };

  const handleFilterOk = () => {
    setIsModalOpen(false);
    onFilter(filterData);
  };

  const handleFilterCancel = () => {
    setIsModalOpen(false);
  };

  const handleReset = () => {
    if (formInstance) {
      formInstance.resetFields();
    }
    setFilterData({projectStatus: null });
    onFilter({projectStatus: null });
  };
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <Input.Search
          placeholder="Quick search ... "
          size="large"
          className="w-full md:w-96"
          onSearch={(value) => onSearch(value)}
          onChange={(e) => onSearch(e.target.value)}
          allowClear
        />
        <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto justify-start md:justify-end">
          <Button type="primary" size="large" onClick={showFilterModal}>
            Filter
          </Button>
          <Dropdown
            menu={{ items }}
            overlayClassName="mt-2" // Optional: Adjust dropdown menu position
          >
            <Button
              size="large"
              className="border border-gray-400 whitespace-nowrap hover:bg-gray-100"
            >
              Sort By
            </Button>
          </Dropdown>
          <Modal
            title="Filter Projects"
            width={750}
            open={isModalOpen}
            onOk={handleFilterOk}
            onCancel={handleFilterCancel}
            footer={[
              <Button key={"reset"} onClick={handleReset}>
                Reset
              </Button>,
              <Button key={"submit"} type="primary" onClick={handleFilterOk}>
                Apply
              </Button>,
            ]}
          >
            <SavedProjectFilterAction onChange={setFilterData} onFormInstance={setFormInstance}/>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default SavedProjectTableTools;
