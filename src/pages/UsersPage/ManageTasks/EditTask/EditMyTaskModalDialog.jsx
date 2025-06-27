import EditMyTaskForm from "./components/EditMyTaskForm";
import React from "react";

const EditMyTaskModalDialog = React.forwardRef(
  ({ task, onChangeForm, user, project, onClose, onSuccess }, ref) => {
    return (
      <EditMyTaskForm
        ref={ref}
        initialValues={task}
        editingTask={task}
        onChangeForm={onChangeForm}
        user={user}
        project={project}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }
);
export default EditMyTaskModalDialog;
