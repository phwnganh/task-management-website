import React, { useEffect, useState } from "react";
import { Form, Input, Select, DatePicker, Tag, Avatar, Tooltip } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import dayjs from "dayjs";

// Dummy data, bạn nên fetch từ props hoặc API thật trong thực tế
const mockMembers = [
  { id: 1, first_name: "Alice", last_name: "Nguyen" },
  { id: 2, first_name: "Bob", last_name: "Pham" },
];
const mockLabels = [
  { id: 1, name: "UI" },
  { id: 2, name: "Backend" },
  { id: 3, name: "Design" },
];

const PRIORITIES = [
  { value: "high", label: <Tag color="red">● high</Tag> },
  { value: "medium", label: <Tag color="gold">● medium</Tag> },
  { value: "low", label: <Tag color="blue">● low</Tag> },
];

const STATUS = [
  { value: "not_started", label: <Tag color="gray">Not started</Tag> },
  { value: "in_progress", label: <Tag color="blue">In Progress</Tag> },
  { value: "done", label: <Tag color="green">Done</Tag> },
];

const { Option } = Select;

const EditTaskForm = React.forwardRef(
  (
    {
      initialValues = {},
      members = mockMembers,
      labels = mockLabels,
      onFieldsChange,
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [editorContent, setEditorContent] = useState(
      initialValues.description || ""
    );

    // Sửa: chỉ reset editor khi đổi task (id), KHÔNG reset khi gõ chữ!
    useEffect(() => {
      form.setFieldsValue({
        ...initialValues,
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date)
          : null,
        due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
      });
      setEditorContent(initialValues.description || "");
      // eslint-disable-next-line
    }, [initialValues.id]); // hoặc truyền 1 prop key duy nhất nhận diện task đang edit

    // Expose methods to parent if needed
    React.useImperativeHandle(ref, () => ({
      getFormValues: () => {
        const values = form.getFieldsValue();
        return {
          ...values,
          assignee_id: values.assignee_id || [],
          labels: values.labels || [],
          start_date: values.start_date
            ? dayjs(values.start_date).format("YYYY/MM/DD")
            : undefined,
          due_date: values.due_date
            ? dayjs(values.due_date).format("YYYY/MM/DD")
            : undefined,
          description: editorContent,
        };
      },
      validate: () => form.validateFields(),
    }));

    // Custom rule: start_date < due_date
    const validateDates = (_, value) => {
      const start = form.getFieldValue("start_date");
      const due = form.getFieldValue("due_date");
      if (start && due && dayjs(start).isAfter(dayjs(due))) {
        return Promise.reject("Start date must be before due date");
      }
      return Promise.resolve();
    };

    return (
      <div className="p-8 rounded-2xl min-w-[340px] bg-white">
        <Form
          form={form}
          layout="vertical"
          onFieldsChange={onFieldsChange}
          initialValues={{
            ...initialValues,
            start_date: initialValues.start_date
              ? dayjs(initialValues.start_date)
              : null,
            due_date: initialValues.due_date
              ? dayjs(initialValues.due_date)
              : null,
          }}
        >
          <h2 className="font-bold text-2xl mb-4">Update Task</h2>
          {/* TITLE */}
          <Form.Item
            label="Title:"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter title..." />
          </Form.Item>

          {/* ASSIGNED TO */}
          <Form.Item
            label="Assigned to:"
            name="assignee_id"
            rules={[{ required: true, message: "Please select member(s)" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select assignee(s)..."
              optionLabelProp="label"
              showArrow
              allowClear
            >
              {members.map((member) => (
                <Option
                  key={member.id}
                  value={member.id}
                  label={`${member.first_name} ${member.last_name}`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar size="small">{member.first_name.charAt(0)}</Avatar>
                    <span>
                      {member.first_name} {member.last_name}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* PRIORITY */}
          <Form.Item
            label="Priority:"
            name="priority"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select>
              {PRIORITIES.map((pri) => (
                <Option key={pri.value} value={pri.value}>
                  {pri.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* STATUS */}
          <Form.Item label="Status:" name="status">
            <Select>
              {STATUS.map((s) => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* LABELS */}
          <Form.Item label="Label:" name="labels">
            <Select
              placeholder="Select label"
              allowClear
              optionLabelProp="label"
            >
              {labels.map((l) => (
                <Option key={l.id} value={l.id} label={l.name}>
                  {l.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* START DATE */}
          <Form.Item
            label="Start date:"
            name="start_date"
            rules={[
              { required: true, message: "Start date is required" },
              { validator: validateDates },
            ]}
          >
            <DatePicker format="YYYY/MM/DD" className="w-full" />
          </Form.Item>

          {/* DUE DATE */}
          <Form.Item
            label="Due date:"
            name="due_date"
            rules={[
              { required: true, message: "Due date is required" },
              { validator: validateDates },
            ]}
          >
            <DatePicker format="YYYY/MM/DD" className="w-full" />
          </Form.Item>

          {/* DESCRIPTION */}
          <Form.Item label="Description:">
            <Editor
              apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
              value={editorContent}
              onEditorChange={setEditorContent}
              init={{
                height: 200,
                menubar: false,
                plugins: [
                  "advlist autolink lists link image",
                  "charmap print preview anchor help",
                  "searchreplace visualblocks code",
                  "insertdatetime media table paste wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic | " +
                  "alignleft aligncenter alignright | " +
                  "bullist numlist outdent indent | help",
              }}
            />
          </Form.Item>
        </Form>
      </div>
    );
  }
);

export default EditTaskForm;
