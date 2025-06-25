import React from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { MANAGE_USER_LIST } from "../../../../constants/routes.constants";
import UserStatusOverviewDashboard from "./UserStatusOverviewDashboard";
import { useTranslation } from "react-i18next";

const UserOverviewDashboard = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  return (
    <div>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <div className="flex items-center space-x-4">
            <h5 className="text-2xl sm:text-3xl md:text-4xl whitespace-nowrap">
              {t("UserOverviewDashboard")}
            </h5>
          </div>
          <div className="mt-2 md:mt-0 w-full md:w-auto">
            <Button
              type="primary"
              size="large"
              className="w-full md:w-auto"
              onClick={() => navigate(MANAGE_USER_LIST)}
            >
              {t("View Detail")}
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
