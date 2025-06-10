import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { Form, Input, Typography } from "antd";

const { Title } = Typography;

const EditMyTaskForm = forwardRef(({ initialValues, onChangeForm }, ref) => {
  const [form] = Form.useForm();

  // Để cha có thể lấy giá trị từ form khi submit
  useImperativeHandle(ref, () => ({
    getFormValues: () => form.getFieldsValue(),
  }));

  // Set lại giá trị mỗi khi initialValues thay đổi
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || "",
        description: initialValues.description || "",
      });
    }
  }, [initialValues, form]);

  // Theo dõi thay đổi để báo cho cha
  useEffect(() => {
    const unsubscribe = form.subscribe?.({
      values: () => {
        const values = form.getFieldsValue();
        const changed =
          values.title !== (initialValues?.title || "") ||
          values.description !== (initialValues?.description || "");
        onChangeForm && onChangeForm(changed);
      },
    });
    // Nếu AntD không hỗ trợ subscribe, thì dùng onValuesChange bên dưới là đủ
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [form, initialValues, onChangeForm]);

  return (
    <div className="p-8 rounded-2xl shadow min-w-[340px] bg-white">
      <Title level={3} className="!mb-6 !text-black">
        Edit My Task
      </Title>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => {
          const values = form.getFieldsValue();
          const changed =
            values.title !== (initialValues?.title || "") ||
            values.description !== (initialValues?.description || "");
          onChangeForm && onChangeForm(changed);
        }}
      >
        <Form.Item
          label="Title:"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
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
