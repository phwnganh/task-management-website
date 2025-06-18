import { Button, Dropdown, Input, Modal } from "antd";
import { useState } from "react";
import ProjectFilterAction from "./ProjectFilterAction";
import { useTranslation } from "react-i18next";

const ProjectsListTableTool = ({ onSearch, onSort, onFilter }) => {
  const { t } = useTranslation("mp");
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
    setFilterData({ role: null, projectStatus: null });
    onFilter({ role: null, projectStatus: null });
  };
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <Input.Search
          placeholder={t("Quick search")}
          size="large"
          className="w-full md:w-96"
          onSearch={(value) => onSearch(value)}
          onChange={(e) => onSearch(e.target.value)}
          allowClear
        />
        <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto justify-start md:justify-end">
          <Button type="primary" size="large" onClick={showFilterModal}>
            {t("Filter")}
          </Button>
          <Dropdown menu={{ items }} overlayClassName="mt-2">
            <Button
              size="large"
              className="border border-gray-400 whitespace-nowrap hover:bg-gray-100"
            >
              {t("Sort by")}
            </Button>
          </Dropdown>
          <Modal
            title={t("Filter Projects")}
            width={750}
            open={isModalOpen}
            onOk={handleFilterOk}
            onCancel={handleFilterCancel}
            footer={[
              <Button key={"reset"} onClick={handleReset}>
                {t("reset")}
              </Button>,
              <Button key={"submit"} type="primary" onClick={handleFilterOk}>
                {t("apply")}
              </Button>,
            ]}
          >
            <ProjectFilterAction
              onChange={setFilterData}
              onFormInstance={setFormInstance}
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

export default ProjectsListTableTool;
