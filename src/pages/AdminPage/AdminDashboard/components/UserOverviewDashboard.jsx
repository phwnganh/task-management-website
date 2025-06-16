import React from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { MANAGE_USER_LIST } from "../../../../constants/routes.constants";
import UserStatusOverviewDashboard from "./UserStatusOverviewDashboard";

const UserOverviewDashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center space-x-4">
            <h4 className="text-3xl sm:text-4xl md:text-5xl whitespace-nowrap">
              User Overview Dashboard
            </h4>
          </div>
          <div className="mt-2 md:mt-0">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(MANAGE_USER_LIST)}
            >
              View Detail
            </Button>
          </div>
        </div>
        <div>
          {/* user status overview dashbboard */}
          <UserStatusOverviewDashboard />
        </div>
      </div>
    </div>
  );
};

export default UserOverviewDashboard;
