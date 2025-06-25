import { Button, Dropdown, Input, Modal } from "antd";
import { useState } from "react";
import SavedProjectFilterAction from "./SavedProjectFilterAction";
import { useTranslation } from "react-i18next";

const SavedProjectTableTools = ({ onSearch, onSort, onFilter }) => {
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
    setFilterData({ projectStatus: null });
    onFilter({ projectStatus: null });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <Input.Search
          placeholder={t("quickSearch")}
          size="large"
          className="w-full md:w-96"
          onSearch={(value) => onSearch(value)}
          onChange={(e) => onSearch(e.target.value)}
          allowClear
        />
        <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto justify-start md:justify-end">
          <Button type="primary" size="large" onClick={showFilterModal}>
            {t("filter")}
          </Button>
          <Dropdown
            menu={{ items }}
            overlayClassName="mt-2" // Optional: Adjust dropdown menu position
          >
            <Button
              size="large"
              className="border border-gray-400 whitespace-nowrap hover:bg-gray-100"
            >
              {t("sortBy")}
            </Button>
          </Dropdown>
          <Modal
            title={t("Filter Project")}
            width={750}
            open={isModalOpen}
            onOk={handleFilterOk}
            onCancel={handleFilterCancel}
            footer={
              <div className="w-full flex flex-col md:flex-row justify-end items-end gap-2">
                <Button key="reset" onClick={handleReset} className="w-full md:w-auto">
                  {t("reset")}
                </Button>
                <Button key="submit" type="primary" onClick={handleFilterOk} className="w-full md:w-auto">
                  {t("apply")}
                </Button>
              </div>
            }
          >
            <SavedProjectFilterAction
              onChange={setFilterData}
              onFormInstance={setFormInstance}
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

export default SavedProjectTableTools;
