import React from "react";
import UpdateLabelForm from "./components/UpdateLableForm";

const UpdateLabelModalDialog = ({ label, onSubmit, onCancel }) => {
  return (
    <UpdateLabelForm
      initialValues={label}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

export default UpdateLabelModalDialog;
