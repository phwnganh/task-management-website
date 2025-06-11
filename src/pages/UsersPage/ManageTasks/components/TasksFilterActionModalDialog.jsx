import { DatePicker, Form, message, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { apiGetProjectMembers } from "../../../../services/UserService/ManageMembersInsideProjectService";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const TasksFilterActionModalDialog = ({ projectId, onChange, onFormInstance }) => {
  const [form] = Form.useForm();

    useEffect(() => {
    onFormInstance(form);
  }, [form, onFormInstance]);
  const [assignees, setAssigness] = useState([]);

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

  const assigneeSelectionDefault = async (projectId) => {
    try {
      const res = await apiGetProjectMembers(projectId);
      console.log("get project members in filter action: ", res);
      const assigneeOptions = res.map((member) => ({
        value: member.user_details.id, // Giá trị là user_id
        label: `${member.user_details.first_name} ${member.user_details.last_name}`, // Hiển thị first_name + last_name
      }));
      setAssigness(assigneeOptions);
    } catch (error) {
      notification.error({
  message: "Error",
  description: error,
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
        <Form.Item
          name={"assignee"}
          label={<span className="text-gray-700 font-medium">Assignee</span>}
        >
          <Select
            placeholder="Select Assignees"
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
