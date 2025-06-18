import { Button, Dropdown } from "antd";

const UserListTableTools = () => {
  const items = [
    {
      key: "All",
      label: "All",
    },
    {
      key: "Active",
      label: "Active",
    },
    {
      key: "Inactive",
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
