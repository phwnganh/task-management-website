import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Button, Upload, message, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../../../../context/useAuth";
import { updateUserProfile } from "../../../../services/UserService/UserService";

const phoneValidator = (_, value) => {
  if (!value) return Promise.resolve();
  const phoneRegex = /^0\d{9}$/;
  if (phoneRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(
    new Error("Phone number must start with 0 and be 10 digits")
  );
};

const ChangeProfileForm = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        dob: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        phoneNumber: user.phone_number || "",
        address: user.address || "",
      });
      setAvatarUrl(user.avatar_url);
    }
  }, [user, form]);

  const onUploadChange = (info) => {
    if (info.file.status === "done" || info.file.status === "uploading") {
      const reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
      reader.onload = () => setAvatarUrl(reader.result);
    }
  };

  const onRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  // Khi bấm nút Save: lưu tạm form values và mở modal xác nhận
  const handleSaveClick = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values);
      setIsModalVisible(true);
    } catch (error) {
      // validate lỗi thì không mở modal
    }
  };

  // Khi user xác nhận modal, gọi API thực sự
  const handleConfirm = async () => {
    setIsModalVisible(false);
    if (!formValues) return;

    try {
      const dataToUpdate = {
        id: user.id,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        date_of_birth: formValues.dob
          ? formValues.dob.format("YYYY-MM-DD")
          : null,
        phone_number: formValues.phoneNumber || null,
        address: formValues.address || null,
        avatar_url: avatarUrl,
        email: user.email,
        role: user.role,
        status: user.status,
        password: user.password,
      };

      const updatedUser = await updateUserProfile(user.id, dataToUpdate);
      updateUser(updatedUser);

      message.success("Profile updated successfully!");
      setFormValues(null);
    } catch (error) {
      console.error("Update profile error:", error);
      message.error("Failed to update profile.");
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const onCancel = () => {
    form.setFieldsValue({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      dob: user.date_of_birth ? dayjs(user.date_of_birth) : null,
      phoneNumber: user.phone_number || "",
      address: user.address || "",
    });
    setAvatarUrl(user?.avatar_url || null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">Change Profile</h2>
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full bg-gray-300 mb-3 overflow-hidden"
            style={{
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : "",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={onUploadChange}
            accept="image/*"
          >
            <Button type="primary" icon={<UploadOutlined />}>
              Upload Image
            </Button>
          </Upload>
          <Button
            className="mt-2"
            onClick={onRemoveAvatar}
            disabled={!avatarUrl}
          >
            Remove
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6"
          onFinish={() => {}}
        >
          
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter first name" }]}
            className="flex flex-col"
          >
            <Input
              placeholder="First name"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter last name" }]}
            className="flex flex-col"
          >
            <Input
              placeholder="Last name"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item
            label="Email (disabled)"
            name="email"
            className="flex flex-col"
          >
            <Input
              placeholder="Email"
              disabled
              className="rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed px-3 py-2"
            />
          </Form.Item>

          <Form.Item
            label="Date Of Birth"
            name="dob"
            rules={[{ required: true, message: "Please select date of birth" }]}
            className="flex flex-col"
          >
            <DatePicker
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              popupClassName="rounded-md"
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ validator: phoneValidator }]}
            className="flex flex-col"
          >
            <Input
              placeholder="Phone number (starts with 0, 10 digits)"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item label="Address" name="address" className="flex flex-col">
            <Input
              placeholder="Address"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item className="col-span-2 flex justify-end mb-0">
            <Button
              onClick={onCancel}
              className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition mr-4 min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveClick}
              className="px-6 py-2 rounded-md min-w-[100px]"
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Modal xác nhận */}
      <Modal
        title="Confirm Change"
        visible={isModalVisible}
        onOk={handleConfirm}
        onCancel={handleCancelModal}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to change your profile?</p>
      </Modal>
    </div>
  );
};

export default ChangeProfileForm;
