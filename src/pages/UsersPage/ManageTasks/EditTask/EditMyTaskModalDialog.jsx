import EditMyTaskForm from "./components/EditMyTaskForm";
import React, { forwardRef } from "react";

const EditMyTaskModalDialog = forwardRef(({ task }, ref) => {
  if (!task) return null;
  return <EditMyTaskForm ref={ref} initialValues={task} />;
});

export default EditMyTaskModalDialog;
