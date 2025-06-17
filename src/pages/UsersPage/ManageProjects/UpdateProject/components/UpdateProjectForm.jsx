import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  notification,
  Spin,
} from "antd";
import {
  apiUpdateProject,
  apiGetProjectList,
} from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;
const { TextArea } = Input;

const UpdateProjectForm = ({ owner, project, onUpdate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(true);

  
  notification.config({
    placement: "bottomRight", 
    duration: 3,  
  });

  useEffect(() => {
    if (project) {
      const safeDesc =
        typeof project.description === "string"
          ? project.description
          : typeof project.description === "number"
          ? project.description.toString()
          : "";

      form.setFieldsValue({
        title: project.title || "",
        description: safeDesc,
      });

      setLoading(false);
    }

    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to fetch project list",
        });
      }
    };

    fetchProjects();
  }, [project, form]);

  const handleFieldChange = (_, allValues) => {
    const currentTitle = allValues.title?.trim() || "";
    const currentDescription = allValues.description?.trim() || "";
    const originalTitle = project.title?.trim() || "";
    const originalDescription =
      typeof project.description === "string"
        ? project.description.trim()
        : "";

    const changed =
      currentTitle !== originalTitle ||
      currentDescription !== originalDescription;

    setIsModified(changed);
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      const title = values.title.trim();
      const description = values.description.trim();

      if (!description) {
        notification.error({
          message: "Description cannot be empty",
        });
        return;
      }

      const duplicate = allProjects.some(
        (p) =>
          p.title.trim() === title &&
          p.owner === owner &&
          p.id !== project.id
      );

      if (duplicate) {
        notification.error({
          message: "Error",
          description:
            "Another project with this title already exists for this owner.",
        });
        return;
      }

      setSubmitting(true);
      try {
        await apiUpdateProject(project.id, {
          title,
          description,
          plain_description: description,
          owner_id: project.owner_id,
        });

        notification.success({
          message: "Success",
          description: "Project updated successfully",
        });

        onUpdate?.();
        form.resetFields();
        onClose?.();
      } catch (err) {
        notification.error({
          message: "Error",
          description: "Failed to update project",
        });
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <Title level={2}>Update Project</Title>
      <Form form={form} layout="vertical" onValuesChange={handleFieldChange}>
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
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            disabled={!isModified}
          >
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateProjectForm;
