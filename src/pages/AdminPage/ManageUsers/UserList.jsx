import React from "react";
import UserListActionTools from "./components/UserListActionTools";
import UserListTableTools from "./components/UserListTableTools";
import UserListTable from "./components/UserListTable";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";

const UserList = () => {
  return (
    <div>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <UserListActionTools />
          {/* <UserListTableTools /> */}
          <UserListTable />
        </div>
      </PostLoginLayout>
    </div>
  );
};

export default UserList;
