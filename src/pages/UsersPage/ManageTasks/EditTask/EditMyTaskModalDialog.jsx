import EditMyTaskForm from "./components/EditMyTaskForm";
import React from "react";

const EditMyTaskModalDialog = React.forwardRef(
  ({ task, onChangeForm }, ref) => {
    return (
      <EditMyTaskForm
        ref={ref}
        initialValues={task}
        onChangeForm={onChangeForm}
      />
    );
  }
);

export default EditMyTaskModalDialog;
