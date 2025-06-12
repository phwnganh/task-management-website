import React, { useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import OtherTaskListActionTool from "./components/OtherTaskListActionTool";
import OtherTaskListTableTools from "./components/OtherTaskListTableTools";
import OtherTaskListTable from "./components/OtherTaskListTable";

const OtherTaskList = ({ projectId }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    start_date: null,
    due_date: null,
    assignee: null,
  });
  return (
    <div>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <OtherTaskListActionTool projectId={projectId}/>
        <OtherTaskListTableTools projectId={projectId} onFilter={setFilters}/>
        <OtherTaskListTable projectId={projectId} filters={filters}/>
      </div>
    </div>
  );
};

export default OtherTaskList;
