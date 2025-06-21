import React from "react";
import { Modal, Button } from "antd";

const RemoveLabelConfirmModal = ({
  visible,
  onOk,
  onCancel,
  labelName,
  loading,
}) => (
  <Modal
    open={visible}
    title="Remove Label"
    onCancel={onCancel}
    footer={[
      <Button key="no" onClick={onCancel}>
        No
      </Button>,
      <Button
        key="yes"
        type="primary"
        danger
        loading={loading}
        onClick={onOk}
      >
        Yes
      </Button>,
    ]}
    centered
    closable
  >
    <p>Are you sure you want to remove this label{labelName ? ` "${labelName}"` : ""}?</p>
  </Modal>
);

export default RemoveLabelConfirmModal;