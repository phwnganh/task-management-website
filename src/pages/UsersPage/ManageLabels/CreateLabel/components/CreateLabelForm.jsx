import React from "react";
import { Form, Input, Button, ColorPicker, message, notification } from "antd";
import { apiCreateLabel } from "../../../../../services/UserService/ManageLabelsService";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useAuth } from "../../../../../context/useAuth";
const CreateLabelForm = ({ onSubmit, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();

  React.useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      color: initialValues?.color || undefined,
    });
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    try {
      const newLabel = {
        id: uuidv4(),
        title: values.title,
        color:
          typeof values.color === "string"
            ? values.color
            : values.color?.toHexString?.() || "#1677ff",
        created_by: user?.id || "unknown",
        created_at: dayjs().toISOString(),
      };
      const res = await apiCreateLabel(newLabel);
      notification.success({
        message: "Success",
        description: "Label created successfully!",
        placement: "bottomRight",
      });
      form.resetFields();
      if (onSubmit) onSubmit(res);
      if (onCancel) onCancel();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Create label failed!",
        placement: "bottomRight",
      });
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
      <br />
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

      <Form.Item className="mt-8 px-2">
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              form.resetFields();
              if (onCancel) onCancel();
            }}
            className="border border-gray-300 px-7 py-2 rounded-lg text-base font-medium hover:bg-gray-100"
          >
            Reset
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
