import EditMyTaskForm from "./components/EditMyTaskForm";

// const EditMyTaskModalDialog = () => {
//       return (<EditMyTaskForm/>)
// }

// export default EditMyTaskModalDialog

<Modal
  width={750}
  open={isEditTaskModalOpen}
  onOk={handleEditTaskModalOk}
  onCancel={handleEditTaskModalCancel}
  footer={[
    <Button key={"cancel"} onClick={handleEditTaskModalCancel}>
      Cancel
    </Button>,
    <Button key={"save"} type="primary" onClick={handleEditTaskModalCancel}>
      Request To Change
    </Button>,
  ]}
>
  {/* Truyền editingTask làm props */}
  <EditMyTaskModalDialog task={editingTask} />
</Modal>;

export default EditMyTaskModalDialog;
