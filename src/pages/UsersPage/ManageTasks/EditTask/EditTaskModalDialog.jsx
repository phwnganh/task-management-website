import EditTaskForm from "./components/EditTaskForm";

const EditTaskModalDialog = ({ task, members, labels, onCancel }) => {
  if (!task) return null; // Chưa chọn thì không render gì
  return (
    <EditTaskForm initialValues={task} members={members} labels={labels} onCancel={onCancel}/>
  );
};
export default EditTaskModalDialog;
