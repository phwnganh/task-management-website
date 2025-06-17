import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, notification } from "antd";
import {
  apiCreateProject,
  apiGetProjectList,
} from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;
const { TextArea } = Input;

const AddProjectForm = ({ owner, onCreate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  notification.config({
    placement: 'bottomRight',
    duration: 3,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        notification.error({
          message: "Failed to fetch existing projects",
        });
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const title = values.title.trim();
        const description = values.description.trim();

        if (!description) {
          notification.error({
            message: "Description cannot be empty",
          });
          return;
        }

        const duplicate = allProjects.some(
          (project) =>
            project.title.trim().toLowerCase() === title.toLowerCase() &&
            project.owner_id === owner.id
        );

        if (duplicate) {
          notification.error({
            message: "Project title already exists for this owner",
          });
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
          });
          onCreate(payload);
          form.resetFields();
          onClose();
        } catch (error) {
          notification.error({
            message: "Error",
            description: "Failed to create project",
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
                if (/^[\d\s]+$/.test(trimmed)) {
                  return Promise.reject(
                    "Title cannot contain only numbers or digits with spaces"
                  );
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
                  return Promise.reject(
                    "Description cannot be empty or whitespace"
                  );
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
