import React from "react";
import { Modal, Badge, Avatar } from "antd";

const statusProps = {
  Active: { status: "success", text: "Active" },
  Inactive: { status: "error", text: "Inactive" },
};

const ViewUserDetailModalDialog = ({ visible, onClose, user }) => {
  if (!user) return null;

  const formatDate = (date) => {
    if (!date) return "";
    if (date.length === 10) return date; // YYYY-MM-DD
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
  };

  const status = statusProps[user.status] || statusProps.Default;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      styles={{
        body: {
          padding: "0",
          borderRadius: 16,
          background: "#fff",
        },
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-8 pt-7 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold mb-0">User Information</h2>
        <Badge
          status={status.status}
          text={status.text}
          className="text-base font-semibold"
          style={{ fontSize: 16 }}
        />
      </div>
      {/* Content chia 2 cột */}
      <div className="flex flex-row px-8 py-7 gap-8">
        {/* Left: Avatar + Name */}
        <div className="flex flex-col items-center min-w-[140px]">
          <Avatar
            size={96}
            src={user.avatar_url}
            alt="Avatar"
            className="bg-white shadow mb-2"
          />
          <div className="mt-2 text-lg font-medium text-gray-900 text-center">
            {user.first_name} {user.last_name}
          </div>
        </div>
        {/* Right: Thông tin chi tiết */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-slate-600">Email:</span>
            <span className="text-slate-700">
              {user.email || <span className="text-gray-400">N/A</span>}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-slate-600">Date of Birth:</span>
            <span className="text-slate-700">
              {formatDate(user.date_of_birth) || (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-slate-600">Phone Number:</span>
            <span className="text-slate-700">
              {user.phone_number || <span className="text-gray-400">N/A</span>}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-slate-600">Address:</span>
            <span className="text-slate-700">
              {user.address || <span className="text-gray-400">N/A</span>}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewUserDetailModalDialog;
