import React from "react";
import UserListActionTools from "./components/UserListActionTools";
import UserListTableTools from "./components/UserListTableTools";
import UserListTable from "./components/UserListTable";

const UserList = () => {
  return (
    <div>
      <UserListActionTools />
      <UserListTableTools />
      <UserListTable />
    </div>
  );
};

export default UserList;
