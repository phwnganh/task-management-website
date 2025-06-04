import { Form, Select } from "antd";
import { useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const ProjectFilterAction = ({onChange, onFormInstance}) => {
  const [form] = Form.useForm();

  onFormInstance(form)
  const [role, setRole] = useState();
  const [projectStatus, setProjectStatus] = useState();

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
      setRole(allValues.role)
      setProjectStatus(allValues.projectStatus)
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
            onChange={(value) => setRole(value)}
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
            onChange={(value) => setProjectStatus(value)}
            allowClear
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default ProjectFilterAction;
