import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Button,
  message,
  notification,
} from "antd";
import dayjs from "dayjs";
import { apiUpdateTaskByOwner } from "../../../../../services/UserService/ManageTasksService";
import isEqual from "lodash/isEqual"; // Cài lodash nếu chưa có: npm i lodash

const { Option } = Select;

const EditTaskForm = ({
  initialValues = {},
  members = [],
  labels = [],
  onUpdateSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [hasChanged, setHasChanged] = useState(false);

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
        description: initialValues.description || "",
      });
      setHasChanged(false); // Reset khi mở modal mới
    }
  }, [initialValues, form]);

  // Hàm này trả về giá trị của form đã chuẩn hóa giống logic handleSubmit
  const getCurrentFormValue = () => {
    const values = form.getFieldsValue();
    return {
      ...values,
      start_date:
        values.start_date && dayjs.isDayjs(values.start_date)
          ? values.start_date.format("YYYY-MM-DD")
          : values.start_date,
      due_date:
        values.due_date && dayjs.isDayjs(values.due_date)
          ? values.due_date.format("YYYY-MM-DD")
          : values.due_date,
    };
  };

  // Kiểm tra thay đổi nội dung so với initialValues
  const checkHasChanged = () => {
    const values = getCurrentFormValue();
    const initial = {
      ...initialValues,
      start_date: initialValues.start_date
        ? dayjs(initialValues.start_date).format("YYYY-MM-DD")
        : undefined,
      due_date: initialValues.due_date
        ? dayjs(initialValues.due_date).format("YYYY-MM-DD")
        : undefined,
    };
    setHasChanged(!isEqual({ ...initial, ...values }, initial));
  };

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

  const validateTextAndNumber = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(
        new Error("Field cannot be empty or only whitespace")
      );
    }

    const trimmed = value.trim();
    const hasLetter = /[a-zA-Z]/.test(trimmed);
    const hasNumber = /[0-9]/.test(trimmed);

    if (!hasLetter) {
      return Promise.reject(
        new Error("Field must contain at least one letter")
      );
    }
    if (/^\s+[\w\d]+/.test(value)) {
      return Promise.reject(new Error("Field cannot start with whitespace"));
    }
    if (/\d+\s+\d+/.test(value)) {
      return Promise.reject(
        new Error("Field cannot contain whitespace between numbers")
      );
    }
    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Format các field ngày, label, v.v. cho đồng nhất kiểu dữ liệu
      values.start_date =
        values.start_date && dayjs.isDayjs(values.start_date)
          ? values.start_date.format("YYYY-MM-DD")
          : values.start_date;
      values.due_date =
        values.due_date && dayjs.isDayjs(values.due_date)
          ? values.due_date.format("YYYY-MM-DD")
          : values.due_date;

      // Chuẩn hoá initialValues để so sánh chính xác
      const initial = {
        ...initialValues,
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date).format("YYYY-MM-DD")
          : undefined,
        due_date: initialValues.due_date
          ? dayjs(initialValues.due_date).format("YYYY-MM-DD")
          : undefined,
      };

      // So sánh values và initial
      if (isEqual({ ...initial, ...values }, initial)) {
        message.info("You have not changed any content.");
        return;
      }

      await apiUpdateTaskByOwner(initialValues.id, {
        ...values,
        project_id: initialValues.project_id,
        status: initialValues.status,
      });

      notification.success({
        message: "Success",
        description: "Update successful!",
        placement: "bottomRight",
      });
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message,
        placement: "bottomRight",
      });
    }
  };

  return (
    <div className="p-8 rounded-2xl min-w-[340px] bg-white">
      <h2 className="font-bold text-2xl mb-4">Edit Task</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={checkHasChanged}
      >
        <Form.Item
          label="Title:"
          name="title"
          rules={[
            { required: true, message: "Title is required" },
            { validator: validateTextAndNumber },
          ]}
        >
          <Input
            placeholder="Enter title..."
            onBlur={(e) => {
              const trimmed = e.target.value.trimStart();
              form.setFieldsValue({ title: trimmed });
            }}
          />
        </Form.Item>

        <Form.Item
          label="Assigned to:"
          name="assignee_ids"
          rules={[{ required: true, message: "Please select member(s)" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select assignee(s)..."
            optionLabelProp="label"
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

        <Form.Item
          label="Priority:"
          name="priority"
          rules={[{ required: true, message: "Please select priority" }]}
        >
          <Select placeholder="Select priority">
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

        <Form.Item label="Status:" shouldUpdate>
          {() => {
            const status = form.getFieldValue("status") || "Not started";
            let color = "gray";
            if (status === "In Progress") color = "blue";
            if (status === "Completed") color = "green";
            if (status === "To Do") color = "orange";
            return <Tag color={color}>{status}</Tag>;
          }}
        </Form.Item>

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

        <Form.Item
          label="Start date:"
          name="start_date"
          rules={[
            { required: true, message: "Start date is required" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const due = getFieldValue("due_date");
                if (value && due && dayjs(value).isAfter(dayjs(due))) {
                  return Promise.reject("Start date must be before due date");
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Due date:"
          name="due_date"
          rules={[
            { required: true, message: "Due date is required" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue("start_date");
                const today = dayjs().startOf("day");
                if (value) {
                  if (dayjs(value).isBefore(today)) {
                    return Promise.reject("Due date must be today or later");
                  }
                  if (start && dayjs(value).isBefore(dayjs(start))) {
                    return Promise.reject("Due date must be after start date");
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            className="w-full"
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
          />
        </Form.Item>

        <Form.Item
          label="Description:"
          name="description"
          rules={[
            { validator: validateTextAndNumber },
            { required: true, message: "Please enter the task description" },
          ]}
        >
          <Input.TextArea
            placeholder="Enter description..."
            rows={4}
            autoSize={{ minRows: 4, maxRows: 8 }}
            onBlur={(e) => {
              const trimmed = e.target.value.trimStart();
              form.setFieldsValue({ description: trimmed });
            }}
          />
        </Form.Item>

        <div className="flex flex-row justify-end">
          <Button className="mr-4" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" disabled={!hasChanged}>
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditTaskForm;
