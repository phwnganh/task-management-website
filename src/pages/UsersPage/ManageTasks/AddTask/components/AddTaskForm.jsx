import { Col, DatePicker, Form, Input, message, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { apiGetLabelList } from "../../../../../services/UserService/ManageLabelsService";
import { apiGetProjectMembers } from "../../../../../services/UserService/ManageMembersInsideProjectService";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const AddTaskForm = ({ projectId, userId }) => {
  const [form] = Form.useForm();
  const [assignees, setAssigness] = useState([]);
  const [labels, setLabels] = useState([]);
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

  const createTask = async (taskData) => {

  }

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
      message.error(error.message);
    }
  };

  const labelsSelectionDefault = async (owner_id) => {
    try {
      const res = await apiGetLabelList(owner_id);
      const labelOptions = res.map((label) => ({
        value: label.id,
        label: label.title,
      }));
      setLabels(labelOptions);
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    assigneeSelectionDefault(projectId);
  }, [projectId]);
  useEffect(() => {
    labelsSelectionDefault(userId);
  }, [userId]);
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto"
        initialValues={{
          title: "",
          assignee: null,
          priority: null,
          status: null,
          label: null,
          start_date: null,
          due_date: null,
          description: "",
        }}
      >
        <Form.Item
          name="title"
          label={
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Title
            </span>
          }
          rules={[{ required: true, message: "Please enter the task title" }]}
        >
          <Input
            placeholder="Enter the task title"
            className="w-full rounded-md"
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="priority"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  Priority
                </span>
              }
              rules={[
                { required: true, message: "Please enter the task priority" },
              ]}
            >
              <Select
                placeholder="Select a Priority"
                options={prioritySelectionDefault}
                allowClear
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="labels"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  Labels
                </span>
              }
            >
              <Select
                placeholder="Select Labels"
                options={labels}
                mode="multiple"
                allowClear
                className="w-full"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="start_date"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  Start Date
                </span>
              }
            >
              <DatePicker
                size="middle"
                allowClear
                className="w-full h-10 rounded-md"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="due_date"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  Due Date
                </span>
              }
            >
              <DatePicker
                size="middle"
                allowClear
                className="w-full h-10 rounded-md"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="assignee"
          label={
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Assignees
            </span>
          }
        >
          <Select
            placeholder="Select Assignees"
            options={assignees}
            mode="multiple"
            allowClear
            className="w-full"
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default AddTaskForm;
