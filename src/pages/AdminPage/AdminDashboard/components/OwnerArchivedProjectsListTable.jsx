import React from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN } from "../../../../constants/routes.constants";

const OwnerArchivedProjectsListTable = () => {
  const navigate = useNavigate();
  return (
    <>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
              View Archived Projects
            </h1>
            <div className="mt-2 md:mt-0">
              <Button type="primary" size="large">
                Export Data
              </Button>
            </div>
          </div>
          <Table />
          <Button
            onClick={() => navigate(ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN)}
          >
            Back
          </Button>
        </div>
      </PostLoginLayout>
    </>
  );
};

export default OwnerArchivedProjectsListTable;
