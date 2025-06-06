import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const SavedProjectFilterAction = ({ onChange, onFormInstance }) => {
  const [form] = Form.useForm();

    useEffect(() => {
      onFormInstance(form);
    }, [form, onFormInstance]);

  const projectStatusSelectionDefault = [
    {
      value: "in-progress",
      label: "In Progress",
    },
    {
      value: "completed",
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
        initialValues={{projectStatus: null }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name={"projectStatus"}
          label={
            <span className="text-gray-700 font-medium">Project Status</span>
          }
        >
          <Select
            placeholder="Select A Project Status"
            options={projectStatusSelectionDefault}
            allowClear
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default SavedProjectFilterAction;
