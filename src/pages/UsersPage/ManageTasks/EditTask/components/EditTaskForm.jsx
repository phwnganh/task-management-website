import React, { useEffect } from "react";
import { Form, Input, Select, DatePicker, Tag, Avatar } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import dayjs from "dayjs";

const { Option } = Select;

const EditTaskForm = ({ initialValues = {}, members = [], labels = [] }) => {
  console.log("initialValues:", initialValues);

  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        assignee_ids: initialValues.assignee_ids || [],
        label_ids: Array.isArray(initialValues.labels)
          ? initialValues.labels.map((l) => (typeof l === "object" ? l.id : l))
          : initialValues.label_ids || [],
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date)
          : null,
        due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
      });
    }
  }, [initialValues, form]);

  // Validate ngày bắt buộc start < due
  const validateDates = () => ({
    validator(_, value) {
      const start = form.getFieldValue("start_date");
      const due = form.getFieldValue("due_date");
      if (start && due && dayjs(start).isAfter(dayjs(due))) {
        return Promise.reject("Start date must be before due date");
      }
      return Promise.resolve();
    },
  });

  return (
    <div className="p-8 rounded-2xl min-w-[340px] bg-white">
      <h2 className="font-bold text-2xl mb-4">Edit Task</h2>
      <Form
        form={form}
        layout="vertical"
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
          name="assignee_ids"
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
                  <Avatar size="small" src={member.avatar_url}>
                    {member.first_name.charAt(0)}
                  </Avatar>
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
            {["High", "Medium", "Low"].map((pri) => (
              <Option key={pri} value={pri}>
                <Tag
                  color={
                    pri === "High"
                      ? "red"
                      : pri === "Medium"
                      ? "orange"
                      : "green"
                  }
                >
                  {pri}
                </Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* STATUS - bạn có thể bổ sung nếu muốn, nếu không thì bỏ qua */}
        <Form.Item label="Status:" shouldUpdate>
          {() => {
            const status = form.getFieldValue("status") || "Not started";
            let color = "gray";
            if (status === "In Progress") color = "blue";
            if (status === "Completed") color = "green";
            if (status === "To Do") color = "orange";
            // Bạn có thể thêm nhiều trạng thái hơn tùy hệ thống của bạn

            return <Tag color={color}>{status}</Tag>;
          }}
        </Form.Item>
        {/* LABELS */}
        <Form.Item
          label="Label:"
          name="label_ids"
          rules={[
            { required: true, message: "Please select at least one label" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select labels"
            allowClear
            optionLabelProp="label"
          >
            {labels.map((l) => (
              <Option key={l.id} value={l.id} label={l.title}>
                <Tag color={l.color}>{l.title}</Tag>
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
            validateDates,
          ]}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>
        {/*END DATE */}
        <Form.Item
          label="Due date:"
          name="due_date"
          rules={[
            { required: true, message: "Due date is required" },
            validateDates,
          ]}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>
        {/* DESCRIPTION tinymce vừa xóa vừa sửa*/}
        <Form.Item label="Description:" name="description">
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
            init={{
              height: 200,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table code help wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic backcolor | \
         alignleft aligncenter alignright alignjustify | \
         bullist numlist outdent indent | removeformat | help",
              content_style:
                "body { font-family:Roboto,sans-serif;font-size:14px }",
            }}
            value={form.getFieldValue("description")}
            onEditorChange={(content) => {
              form.setFieldsValue({ description: content });
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTaskForm;
