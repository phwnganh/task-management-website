import React from "react";
import { Form, Input, Button, ColorPicker, message } from "antd";
import { apiCreateLabel } from "../../../../../services/UserService/ManageLabelsService";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useAuth } from "../../../../../context/useAuth"; // Đảm bảo đúng đường dẫn context

const CreateLabelForm = ({ onSubmit, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const { user } = useAuth(); // Lấy thông tin user để lấy created_by

  React.useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      color: initialValues?.color || undefined,
    });
  }, [initialValues, form]);

  // Submit label: lưu vào database qua apiCreateLabel
  const handleFinish = async (values) => {
    try {
      // Gửi lên database với đủ trường bạn yêu cầu
      const newLabel = {
        id: uuidv4(),
        title: values.title,
        color: typeof values.color === "string" ? values.color : values.color?.toHexString?.() || "#1677ff",
        created_by: user?.id || "unknown",
        created_at: dayjs().toISOString(),
      };
      const res = await apiCreateLabel(newLabel);
      message.success("Label created successfully!");
      form.resetFields();
      if (onSubmit) onSubmit(res); // callback nếu cần
      if (onCancel) onCancel();    // đóng modal nếu cần
    } catch (error) {
      message.error(error.message || "Create label failed!");
    }
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ flex: "90px" }}
      wrapperCol={{ flex: "auto" }}
      colon={false}
      className="pt-2 pb-0 px-2 w-full"
      onFinish={handleFinish}
      initialValues={{
        title: "",
        color: undefined,
      }}
    >
      <Form.Item
        label={<span className="font-semibold text-base">Title:</span>}
        name="title"
        rules={[{ required: true, message: "Please enter label name" }]}
      >
        <Input
          placeholder="Label name"
          autoFocus
          maxLength={32}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-base"
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-semibold text-base">Color:</span>}
        name="color"
        rules={[{ required: true, message: "Please select a color" }]}
        valuePropName="value"
      >
        <ColorPicker
          showText={false}
          allowClear
          size="large"
          className="rounded-full"
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      {/* Nút Cancel & Create ở dưới bên phải */}
      <Form.Item className="mt-8 px-2">
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              form.resetFields();
              if (onCancel) onCancel();
            }}
            className="border border-gray-300 px-7 py-2 rounded-lg text-base font-medium hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-[#1677ff] px-7 py-2 rounded-lg text-base font-medium"
          >
            Create
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default CreateLabelForm;
