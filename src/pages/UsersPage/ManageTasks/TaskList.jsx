import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { apiUpdateRecentlyViewedProject } from "../../../services/UserService/UserService";
import { useEffect, useRef, useState } from "react";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import TasksListActionTool from "./components/TasksListActionTool";
import TasksListTableTool from "./components/TasksListTableTool";
import TasksListTable from "./components/TasksListTable";

const TaskList = () => {
  const { user } = useAuth();
  const { projectId } = useParams();
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    start_date: null,
    due_date: null,
    assignee: null,
  });
  return (
    <>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <TasksListActionTool projectId={projectId} />
          <TasksListTableTool projectId={projectId} onFilter={setFilters} />
          <TasksListTable projectId={projectId} filters={filters}/>
        </div>
      </PostLoginLayout>
    </>
  );
};

export default TaskList;
