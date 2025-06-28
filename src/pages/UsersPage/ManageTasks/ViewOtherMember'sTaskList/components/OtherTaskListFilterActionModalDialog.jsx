import { DatePicker, Form, message, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGetOtherProjectMembers } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import { useAuth } from "../../../../../context/useAuth";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const OtherTaskListFilterActionModalDialog = ({
  projectId,
  onChange,
  onFormInstance,
}) => {
  const { t } = useTranslation("taskcalendar");
  const [form] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    onFormInstance(form);
  }, [form, onFormInstance]);

  const [assignees, setAssignees] = useState([]);

  const prioritySelectionDefault = [
    {
      value: "Low",
      label: t("Low"),
    },
    {
      value: "Medium",
      label: t("Medium"),
    },
    {
      value: "High",
      label: t("High"),
    },
  ];

  const statusSelectionDefault = [
    {
      value: "To Do",
      label: t("To Do"),
    },
    {
      value: "In Progress",
      label: t("In Progress"),
    },
    {
      value: "Completed",
      label: t("Completed"),
    },
  ];

  const assigneeSelectionDefault = async (projectId, currentUserId) => {
    try {
      const res = await apiGetOtherProjectMembers(projectId, currentUserId);
      const assigneeOptions = res.map((member) => ({
        value: member.user_details.id,
        label: `${member.user_details.first_name} ${member.user_details.last_name}`,
      }));
      setAssignees(assigneeOptions);
    } catch (error) {
      message.error(t("error"));
    }
  };

  useEffect(() => {
    assigneeSelectionDefault(projectId, user.id);
  }, [projectId, user.id]);

  const handleValuesChange = (_, allValues) => {
    onChange(allValues);
  };

  return (
    <div>
      <Form
        {...layout}
        form={form}
        className="space-y-6"
        layout="vertical"
        initialValues={{
          priority: null,
          status: null,
          start_date: null,
          due_date: null,
          assignee: null,
        }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="priority"
          label={
            <span className="text-gray-700 font-medium">{t("priority")}</span>
          }
        >
          <Select
            placeholder={t("selectPriority")}
            options={prioritySelectionDefault}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="status"
          label={
            <span className="text-gray-700 font-medium">{t("status")}</span>
          }
        >
          <Select
            placeholder={t("selectStatus")}
            options={statusSelectionDefault}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="start_date"
          label={
            <span className="text-gray-700 font-medium">{t("startDate")}</span>
          }
        >
          <DatePicker
            size="middle"
            allowClear
            className="w-full h-10 !rounded-md"
            placeholder={t("startDate") || "startDate"}
          />
        </Form.Item>
        <Form.Item
          name="due_date"
          label={
            <span className="text-gray-700 font-medium">{t("dueDate")}</span>
          }
        >
          <DatePicker
            size="middle"
            allowClear
            className="w-full h-10 !rounded-md"
            placeholder={t("dueDate") || "dueDate"}
          />
        </Form.Item>
        <Form.Item
          name="assignee"
          label={
            <span className="text-gray-700 font-medium">{t("assignees")}</span>
          }
        >
          <Select
            placeholder={t("selectAssignees")}
            options={assignees}
            mode="multiple"
            allowClear
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default OtherTaskListFilterActionModalDialog;
