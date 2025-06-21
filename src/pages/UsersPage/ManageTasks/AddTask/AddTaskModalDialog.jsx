import AddTaskForm from "./components/AddTaskForm";

const AddTaskModalDialog = ({ projectId, userId }) => {
  return (
    <>
      <AddTaskForm projectId={projectId} userId={userId} />
    </>
  );
};

export default AddTaskModalDialog;
