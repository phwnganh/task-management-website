import React, { useEffect, useState, useCallback } from "react";
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
import isEqual from "lodash/isEqual";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../context/useAuth";
import { UserOutlined } from "@ant-design/icons";

const { Option } = Select;

const EditTaskForm = ({
  initialValues = {},
  members = [],
  labels = [],
  onUpdateSuccess,
  onCancel,
}) => {
  const { t } = useTranslation("taskowner");
  const [form] = Form.useForm();
  const [hasChanged, setHasChanged] = useState(false);
  const { user } = useAuth();

  // Debounced check for changes
  const debouncedCheckHasChanged = useCallback(
    debounce(() => {
      const values = getCurrentFormValue();
      const initial = {
        ...initialValues,
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date).toISOString()
          : undefined,
        due_date: initialValues.due_date
          ? dayjs(initialValues.due_date).toISOString()
          : undefined,
      };
      setHasChanged(!isEqual({ ...initial, ...values }, initial));
    }, 300),
    [initialValues]
  );

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

  const getCurrentFormValue = () => {
    const values = form.getFieldsValue();
    return {
      ...values,
      start_date: values.start_date
        ? values.start_date.toISOString()
        : undefined,
      due_date: values.due_date ? values.due_date.toISOString() : undefined,
    };
  };

  const validateDates = () => ({
    validator(_, value) {
      const start = form.getFieldValue("start_date");
      const due = form.getFieldValue("due_date");
      if (start && due && dayjs(start).isAfter(dayjs(due))) {
        return Promise.reject(t("dateValidation"));
      }
      return Promise.resolve();
    },
  });

  const validateTextAndNumber = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error(t("titleRequired")));
    }

    const trimmed = value.trim();
    const hasLetter = /[a-zA-Z]/.test(trimmed);
    const hasNumber = /[0-9]/.test(trimmed);

    if (!hasLetter) {
      return Promise.reject(new Error(t("titleValidation")));
    }
    if (/^\s+[\w\d]+/.test(value)) {
      return Promise.reject(new Error(t("titleValidation")));
    }
    if (/\d+\s+\d+/.test(value)) {
      return Promise.reject(new Error(t("titleValidation")));
    }
    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Convert dates to ISO strings for API submission
      const payload = {
        ...values,
        start_date: values.start_date
          ? values.start_date.toISOString()
          : undefined,
        due_date: values.due_date ? values.due_date.toISOString() : undefined,
        project_id: initialValues.project_id,
        status: initialValues.status,
      };

      const initial = {
        ...initialValues,
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date).toISOString()
          : undefined,
        due_date: initialValues.due_date
          ? dayjs(initialValues.due_date).toISOString()
          : undefined,
      };

      if (isEqual({ ...initial, ...payload }, initial)) {
        message.info(t("noChanges"));
        return;
      }

      await apiUpdateTaskByOwner(initialValues.id, payload);

      notification.success({
        message: t("successMessage"),
        description: t("successDescription"),
        placement: "bottomRight",
      });
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      notification.error({
        message: t("errorMessage"),
        description: t("errorDescription", { error: err.message }),
        placement: "bottomRight",
      });
    }
  };

  return (
    <div className="p-8 rounded-2xl min-w-[340px] bg-white">
      <h2 className="font-bold text-2xl mb-4">{t("editTask")}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={debouncedCheckHasChanged}
      >
        <Form.Item
          label={t("title")}
          name="title"
          rules={[
            { required: true, message: t("titleRequired") },
            { validator: validateTextAndNumber },
          ]}
        >
          <Input
            placeholder={t("title")}
            onBlur={(e) => {
              const trimmed = e.target.value.trimStart();
              form.setFieldsValue({ title: trimmed });
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("assignedTo")}
          name="assignee_ids"
          rules={[{ required: true, message: t("assignedRequired") }]}
        >
          <Select
            mode="multiple"
            placeholder={t("assignedTo")}
            optionLabelProp="label"
            allowClear
          >
            {members.map((member) => (
              <Option
                key={member.id}
                value={member.id}
                label={
                  member.id === user.id
                    ? t("Me")
                    : `${member.first_name} ${member.last_name}`
                }
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    size="small"
                    src={member.avatar_url}
                    icon={!member.avatar_url && <UserOutlined />}
                  >
                    {member.first_name.charAt(0)}
                  </Avatar>
                  <span>
                    {member.id === user.id
                      ? t("Me")
                      : `${member.first_name} ${member.last_name}`}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t("priority")}
          name="priority"
          rules={[{ required: true, message: t("priorityRequired") }]}
        >
          <Select placeholder={t("priority")}>
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

        <Form.Item label={t("status")} shouldUpdate>
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
          label={t("label")}
          name="label_ids"
          rules={[{ required: true, message: t("labelRequired") }]}
        >
          <Select
            mode="multiple"
            placeholder={t("label")}
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
          label={t("startDate")}
          name="start_date"
          rules={[
            { required: true, message: t("startDateRequired") },
            validateDates,
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            className="w-full"
            placeholder={t("startDate") || "startDate"}
          />
        </Form.Item>

        <Form.Item
          label={t("dueDate")}
          name="due_date"
          rules={[
            { required: true, message: t("dueDateRequired") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue("start_date");
                const today = dayjs().startOf("day");
                if (value) {
                  if (dayjs(value).isBefore(today)) {
                    return Promise.reject(t("dueDateValidation"));
                  }
                  if (start && dayjs(value).isBefore(dayjs(start))) {
                    return Promise.reject(t("dueDateValidation"));
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
            placeholder={t("dueDate") || "duetDate"}
          />
        </Form.Item>

        <Form.Item
          label={t("description")}
          name="description"
          rules={[
            { validator: validateTextAndNumber },
            { required: true, message: t("descriptionRequired") },
          ]}
        >
          <Input.TextArea
            placeholder={t("description")}
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
            {t("cancel")}
          </Button>
          <Button type="primary" htmlType="submit" disabled={!hasChanged}>
            {t("update")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditTaskForm;
