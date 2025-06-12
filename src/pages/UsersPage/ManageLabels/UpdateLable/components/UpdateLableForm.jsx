import React, { useEffect, useState } from "react";
import { Form, Input, Button, ColorPicker, notification } from "antd";
import { apiUpdateLabel } from "../../../../../services/UserService/ManageLabelsService";
import { useAuth } from "../../../../../context/useAuth";

const UpdateLabelForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      color: initialValues?.color || undefined,
    });
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    try {
      const updatedLabel = {
        ...initialValues,
        ...values,
        color:
          typeof values.color === "string"
            ? values.color
            : values.color?.toHexString?.() || initialValues.color,
        created_by: user?.id || initialValues.created_by, 
      };
      await apiUpdateLabel(updatedLabel);
      notification.success({
        message: "Success",
        description: "Label updated successfully!",
        placement: "bottomRight",
      });
      form.resetFields();
      if (onSubmit) onSubmit(updatedLabel);
      if (onCancel) onCancel();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Update label failed!",
        placement: "bottomRight",
      });
    }
  };

  // Track changes in form values
  const handleChange = () => {
    const currentValues = form.getFieldsValue();
    const titleChanged = currentValues.title !== initialValues?.title;
    const colorChanged = currentValues.color !== initialValues?.color;
    setIsChanged(titleChanged || colorChanged);
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
      onValuesChange={handleChange}
      initialValues={initialValues}
    >
      <br />
      <Form.Item
        label={<span className="font-semibold text-base">Title:</span>}
        name="title"
        rules={[{ required: true, message: "Please enter label name" }]}
      >
        <Input
          placeholder="Label name"
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
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-[#1677ff] px-7 py-2 rounded-lg text-base font-medium"
            disabled={!isChanged} 
          >
            Update
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default UpdateLabelForm;
