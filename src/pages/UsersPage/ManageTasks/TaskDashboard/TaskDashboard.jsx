import React from 'react';
import TaskOverviewDashboard from './components/TaskOverviewDashboard';
import TaskDetailDashboard from './components/TaskDetailDashboard';

const TaskDashboard = () => {
      return (
            <div>
                  <TaskOverviewDashboard/>
                  <TaskDetailDashboard/>
            </div>
      );
};

export default TaskDashboard;