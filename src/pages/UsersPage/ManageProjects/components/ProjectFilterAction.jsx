import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const ProjectFilterAction = ({onChange, onFormInstance}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    onFormInstance(form);
  }, [form, onFormInstance]);

  const roleSelectionDefault = [
    {
      value: "owner",
      label: "Owner",
    },
    {
      value: "member",
      label: "Member",
    },
  ];

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
      onChange(allValues)
  }

  return (
    <>
      <Form
        {...layout}
        form={form}
        className="space-y-6"
        layout="vertical"
        initialValues={{ role: null, projectStatus: null }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name={"role"}
          label={<span className="text-gray-700 font-medium">Role</span>}
        >
          <Select
            placeholder="Select A Role"
            options={roleSelectionDefault}
            allowClear
          />
        </Form.Item>
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

export default ProjectFilterAction;
