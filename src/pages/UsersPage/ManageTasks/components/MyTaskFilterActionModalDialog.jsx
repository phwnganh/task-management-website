import { DatePicker, Form, Select } from "antd";
import { useEffect } from "react";

const MyTaskFilterActionModalDialog = ({ onChange, onFormInstance }) => {
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
      label: "Low",
    },
    {
      value: "Medium",
      label: "Medium",
    },
    {
      value: "High",
      label: "High",
    },
  ];

  const statusSelectionDefault = [
    {
      value: "To Do",
      label: "To Do",
    },
    {
      value: "In Progress",
      label: "In Progress",
    },
    {
      value: "Completed",
      label: "Completed",
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
          name={"priority"}
          label={<span className="text-gray-700 font-medium">Priority</span>}
        >
          <Select
            placeholder="Select A Priority"
            options={prioritySelectionDefault}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name={"status"}
          label={<span className="text-gray-700 font-medium">Status</span>}
        >
          <Select
            placeholder="Select A Status"
            options={statusSelectionDefault}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name={"start_date"}
          label={<span className="text-gray-700 font-medium">Start Date</span>}
        >
          <DatePicker
            size="middle"
            allowClear
            className="w-full h-10 !rounded-md"
          />
        </Form.Item>
        <Form.Item
          name={"due_date"}
          label={<span className="text-gray-700 font-medium">Due Date</span>}
        >
          <DatePicker
            size="middle"
            allowClear
            className="w-full h-10 !rounded-md"
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default MyTaskFilterActionModalDialog;
