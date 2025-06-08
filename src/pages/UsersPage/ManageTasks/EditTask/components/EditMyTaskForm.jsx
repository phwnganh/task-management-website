import React from "react";
import { Form, Input, Typography } from "antd";

import EditMyTaskForm from "../components/EditMyTaskForm";

// Nhận prop task, truyền xuống form làm initialValues
const EditMyTaskModalDialog = ({ task }) => {
  // Có thể kiểm tra nếu chưa có task thì render loading/null
  if (!task) return null;
  return <EditMyTaskForm initialValues={task} />;
};

export default EditMyTaskModalDialog;
