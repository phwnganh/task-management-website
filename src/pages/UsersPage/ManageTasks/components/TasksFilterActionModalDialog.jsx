import { DatePicker, Form, message, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGetProjectMembers } from "../../../../services/UserService/ManageMembersInsideProjectService";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const TasksFilterActionModalDialog = ({
  projectId,
  onChange,
  onFormInstance,
}) => {
  const { t } = useTranslation("taskcalendar");
  const [form] = Form.useForm();

  useEffect(() => {
    onFormInstance(form);
  }, [form, onFormInstance]);
  const [assignees, setAssignees] = useState([]);

  const prioritySelectionDefault = [
    {
      value: "Low",
      label: t("Low"), // Dịch "Low"
    },
    {
      value: "Medium",
      label: t("Medium"), // Dịch "Medium"
    },
    {
      value: "High",
      label: t("High"), // Dịch "High"
    },
  ];

  const statusSelectionDefault = [
    {
      value: "To Do",
      label: t("To Do"), // Dịch "To Do"
    },
    {
      value: "In Progress",
      label: t("In Progress"), // Dịch "In Progress"
    },
    {
      value: "Completed",
      label: t("Completed"), // Dịch "Completed"
    },
  ];

  const assigneeSelectionDefault = async (projectId) => {
    try {
      const res = await apiGetProjectMembers(projectId);
      console.log("get project members in filter action: ", res);
      const assigneeOptions = res.map((member) => ({
        value: member.user_details.id,
        label: `${member.user_details.first_name} ${member.user_details.last_name}`,
      }));
      setAssignees(assigneeOptions);
    } catch (error) {
      notification.error({
        message: t("error"),
        description: error.message,
        placement: "bottomRight",
      });
    }
  };

  useEffect(() => {
    assigneeSelectionDefault(projectId);
  }, [projectId]);

  const handleValuesChange = (_, allValues) => {
    onChange(allValues);
  };
  return (
    <>
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
    </>
  );
};

export default TasksFilterActionModalDialog;
