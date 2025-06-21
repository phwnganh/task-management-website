import EditTaskForm from "./components/EditTaskForm";

const EditTaskModalDialog = ({
  task,
  members,
  labels,
  onUpdateSuccess, // <- nhận prop này
  onCancel,
}) => {
  if (!task) return null;
  return (
    <EditTaskForm
      initialValues={task}
      members={members}
      labels={labels}
      onUpdateSuccess={onUpdateSuccess} // <- truyền prop này
      onCancel={onCancel}
    />
  );
};

export default EditTaskModalDialog;
