import { Button, Dropdown, Input } from "antd";

const ProjectsListTableTool = ({ onSearch, onSort }) => {
  const items = [
    {
      key: 'all',
      label: "All",
      onClick: () => onSort(null, null), // Reset sorting
    },
    {
      key: "a-z",
      label: "A-Z",
      onClick: () => onSort("title", "asc")
    },
    {
      key: "z-a",
      label: "Z-A",
      onClick: () => onSort("title", "desc")
    },
    {
      key: "latest",
      label: "Latest",
      onClick: () => onSort("created_at", "desc")
    },
    {
      key: "oldest",
      label: "Oldest",
      onClick: () => onSort("created_at", "asc")
    },
  ];
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <Input.Search
          placeholder="Quick search ..."
          size="large"
          className="w-full md:w-96"
          onSearch={(value) => onSearch(value)}
          onChange={(e) => onSearch(e.target.value)}
          allowClear
        />
        <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto justify-start md:justify-end">
          <Button type="primary" size="large">
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
        </div>
      </div>
    </>
  );
};

export default ProjectsListTableTool;
