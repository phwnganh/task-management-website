import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { apiGetLabelList } from "../../../../../services/UserService/ManageLabelsService";
import { apiGetProjectMembers } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import { apiCreateTask } from "../../../../../services/UserService/ManageTasksService";
import { Editor } from "@tinymce/tinymce-react";
import moment from "moment/moment";
import dayjs from "dayjs";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const AddTaskForm = ({ projectId, userId }) => {
  const [form] = Form.useForm();
  const [assignees, setAssigness] = useState([]);
  const [labels, setLabels] = useState([]);
  const editorRef = useRef(null); // Keeps TinyMCE reference
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

  const createTask = async (values) => {
    try {
      const taskData = {
        project_id: projectId,
        title: values.title,
        priority: values.priority,
        status: "To Do",
        label_ids: values.labels || [],
        start_date: values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : null,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : null,
        assignee_ids: values.assignee || [],
        description: editorRef.current ? editorRef.current.getContent() : "",
      };
      const res = await apiCreateTask(taskData);
      message.success("Task created successfully!");
      form.resetFields();
      if (editorRef.current) {
        editorRef.current.setContent(""); // Reset TinyMCE content
      }
      return res;
    } catch (error) {
      message.error(`Failed to create task: ${error.message}`);
    }
  };

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

  const handleReset = () => {
    form.resetFields();
    if (editorRef.current) {
      editorRef.current.setContent(""); // Đặt lại nội dung của TinyMCE
    }
  };

  const validateStartDate = (_, value) => {
    const dueDate = form.getFieldValue("due_date");
    if (
      value &&
      dueDate &&
      dayjs(value).isAfter(dayjs(dueDate).format("YYYY-MM-DD"))
    ) {
      return Promise.reject(new Error("Start date must be before due date"));
    }
    return Promise.resolve();
  };

  const validateDueDate = (_, value) => {
    const startDate = form.getFieldValue("start_date");
    const currentDate = dayjs();

    if (value && dayjs(value).isBefore(currentDate, "day")) {
      return Promise.reject(new Error("Due date must be today or later"));
    } else if (
      value &&
      startDate &&
      dayjs(value).isBefore(dayjs(startDate).format("YYYY-MM-DD"))
    ) {
      return Promise.reject(new Error("Due date must be after start date"));
    }
    return Promise.resolve();
  };
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
          status: "To Do",
          label: null,
          start_date: null,
          due_date: null,
          description: "",
        }}
        onFinish={createTask}
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
                { required: true, message: "Please select the task priority" },
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
              rules={[
                { required: true, message: "Please select the task labels" },
              ]}
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
              rules={[
                { required: true, message: "Please select the start date" },
                { validator: validateStartDate },
              ]}
              dependencies={["due_date"]}
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
              rules={[
                { required: true, message: "Please select the due date" },
                { validator: validateDueDate },
              ]}
              dependencies={["start_date"]}
            >
              <DatePicker
                size="middle"
                allowClear
                className="w-full h-10 rounded-md"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
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
          rules={[{ required: true, message: "Please select the assignees" }]}
        >
          <Select
            placeholder="Select Assignees"
            options={assignees}
            mode="multiple"
            allowClear
            className="w-full"
          />
        </Form.Item>
        <Form.Item label={<span className="font-semibold">Description</span>}>
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
            init={{
              height: 200,
              menubar: false,
              placeholder: "Enter project description",
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "help",
                "searchreplace",
                "visualblocks",
                "code",
                "insertdatetime",
                "media",
                "table",
                "wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic | " +
                "alignleft aligncenter alignright | " +
                "bullist numlist outdent indent | help",
            }}
            onInit={(evt, editor) => (editorRef.current = editor)}
            onEditorChange={(content) => {
              form.setFieldsValue({ description: content }); // Sync editor content with form
            }}
          />
        </Form.Item>
        <div className="flex flex-row justify-end">
          <Button className="mr-4" onClick={handleReset}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </div>
      </Form>
    </>
  );
};

export default AddTaskForm;
