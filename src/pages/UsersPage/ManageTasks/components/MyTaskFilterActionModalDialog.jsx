import { DatePicker, Form, Select } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const MyTaskFilterActionModalDialog = ({ onChange, onFormInstance }) => {
  const { t } = useTranslation("taskcalendar");
  const [form] = Form.useForm();

  useEffect(() => {
    onFormInstance(form);
  }, [form, onFormInstance]);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

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
      </Form>
    </>
  );
};

export default MyTaskFilterActionModalDialog;
