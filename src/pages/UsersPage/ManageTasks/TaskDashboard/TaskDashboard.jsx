import React from "react";
import TaskOverviewDashboard from "./components/TaskOverviewDashboard";
import TaskDetailDashboard from "./components/TaskDetailDashboard";

const TaskDashboard = ({ projectId }) => {
  return (
    <div>
      <TaskOverviewDashboard />
      <TaskDetailDashboard projectId={projectId} />
    </div>
  );
};

export default TaskDashboard;
