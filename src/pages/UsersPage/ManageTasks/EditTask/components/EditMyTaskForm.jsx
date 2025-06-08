import React, { forwardRef, useImperativeHandle } from "react";
import { Form, Input, Typography } from "antd";

const { Title } = Typography;

const EditMyTaskForm = forwardRef(({ initialValues }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    getFormValues: () => form.getFieldsValue(),
  }));

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || "",
        description: initialValues.description || "",
      });
    }
  }, [initialValues, form]);

  return (
    <div className="p-8 rounded-2xl shadow min-w-[340px] bg-white">
      <Title level={3} className="!mb-6 !text-black">
        View My Task Detail
      </Title>
      <Form form={form} layout="vertical">
        <Form.Item label="Title:" name="title">
          <Input placeholder="Enter title..." />
        </Form.Item>
        <Form.Item label="Description:" name="description">
          <Input.TextArea placeholder="Enter description..." rows={4} />
        </Form.Item>
      </Form>
    </div>
  );
});

export default EditMyTaskForm;
