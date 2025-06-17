import { Button, Modal } from "antd";
import { useState } from "react";

const UserListActionTools = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
      <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
        Manage Users
      </h1>
      <div className="mt-2 md:mt-0">
        <Button type="primary" size="large">
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default UserListActionTools;
