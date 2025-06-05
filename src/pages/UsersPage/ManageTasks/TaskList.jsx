import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { apiUpdateRecentlyViewedProject } from "../../../services/UserService/UserService";
import { useEffect, useRef } from "react";

const TaskList = () => {
  const { user } = useAuth();
  const { projectId } = useParams();
  return <></>;
};

export default TaskList;