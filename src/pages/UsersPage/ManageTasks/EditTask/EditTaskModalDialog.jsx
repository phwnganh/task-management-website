import EditTaskForm from "./components/EditTaskForm";

const EditTaskModalDialog = ({ task, members, labels }) => {
  if (!task) return null; // Chưa chọn thì không render gì
  return (
    <EditTaskForm initialValues={task} members={members} labels={labels} />
  );
};
export default EditTaskModalDialog;
