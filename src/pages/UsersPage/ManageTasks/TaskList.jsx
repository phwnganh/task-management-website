import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useEffect, useRef, useState } from "react";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import TasksListActionTool from "./components/TasksListActionTool";
import TasksListTableTool from "./components/TasksListTableTool";
import TasksListTable from "./components/TasksListTable";
import MyTaskListTableTool from "./components/MyTaskListTableTool";
import MyTaskListTable from "./components/MyTaskListTable";
import { apiGetProjectDetail } from "../../../services/UserService/ManageProjectsService";
import { Tabs } from "antd";

const TaskList = ({ projectId, project }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    start_date: null,
    due_date: null,
    assignee: null,
  });

  const [myFilters, setMyFilters] = useState({
    priority: null,
    status: null,
    start_date: null,
    due_date: null,
  });

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <TasksListActionTool
          projectId={projectId}
          projectData={project}
          userId={user.id}
        />
        {project && user.id === project.owner_id ? (
          <>
            <TasksListTableTool projectId={projectId} onFilter={setFilters} />
            <TasksListTable projectId={projectId} filters={filters} />
          </>
        ) : (
          <>
            <MyTaskListTableTool onMyFilter={setMyFilters} />
            <MyTaskListTable filters={myFilters} projectId={projectId} />
          </>
        )}
      </div>
    </>
  );
};

export default TaskList;
