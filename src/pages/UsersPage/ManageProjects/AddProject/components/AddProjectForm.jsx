import { useState } from "react";
import { Form, Input, Button, Typography, message, notification } from "antd";
import { apiCreateProject } from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;
const { TextArea } = Input;

const AddProjectForm = ({ owner, onCreate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const title = values.title.trim();
        const description = values.description.trim();

        if (!description) {
          message.error("Description cannot be empty");
          return;
        }

        const duplicate = allProjects.some(
          (project) =>
            project.title.trim() === title &&
            project.owner_id === owner.id
        );

        if (duplicate) {
          message.error("Project title already exists for this owner");
          return;
        }

        setSubmitting(true);
        try {
          const payload = {
            title,
            description,
            owner_id: owner.id,
          };

          await apiCreateProject(payload);
          notification.success({
            message: "Success",
            description: "Project created successfully",
            placement: "bottomRight",
          });
          onCreate(payload);
          form.resetFields();
          onClose();
        } catch (error) {
          notification.error({
            message: "Error",
            description: "Failed to create project",
            placement: "bottomRight",
          });
        } finally {
          setSubmitting(false);
        }
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <Title level={2}>Create New Project</Title>
      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="font-semibold">Title:</span>}
          name="title"
          rules={[
            { required: true, message: "Please enter a project title" },
            {
              validator: (_, value) => {
                const trimmed = value?.trim();
                if (!trimmed) {
                  return Promise.reject("Title cannot be empty or whitespace");
                }
                if (/^\d+$/.test(trimmed)) {
                  return Promise.reject("Title cannot be only numbers");
                }
                if (!/^[A-Za-z0-9\s\-_,\.;:()]+$/.test(trimmed)) {
                  return Promise.reject(
                    "Title can only contain letters, numbers, and basic punctuation"
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Enter project title" className="w-1/2" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">Description:</span>}
          name="description"
          rules={[
            { required: true, message: "Please enter a project description" },
            {
              validator: (_, value) => {
                const trimmed = value?.trim();
                if (!trimmed) {
                  return Promise.reject("Description cannot be empty or whitespace");
                }
                if (/^[\d\s]+$/.test(trimmed)) {
                  return Promise.reject(
                    "Description cannot contain only numbers or digits with spaces"
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextArea
            placeholder="Enter project description"
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >
            Reset
          </Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddProjectForm;
