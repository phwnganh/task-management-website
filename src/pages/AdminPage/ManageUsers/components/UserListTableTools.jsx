import { Button, Dropdown } from "antd";

const UserListTableTools = () => {
  const items = [
    {
      key: "all",
      label: "All",
    },
    {
      key: "active",
      label: "Active",
    },
    {
      key: "inactive",
      label: "Inactive",
    },
  ];

  return (
    <div className="w-full flex justify-end">
      <Dropdown menu={{ items }} overlayClassName="mt-2">
        <Button
          size="large"
          className="border border-gray-400 whitespace-nowrap hover:bg-gray-100"
        >
          Filter
        </Button>
      </Dropdown>
    </div>
  );
};

export default UserListTableTools;
