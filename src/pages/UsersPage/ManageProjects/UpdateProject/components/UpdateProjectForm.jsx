import { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  notification,
  Spin,
  message,
} from "antd";
import { Editor } from "@tinymce/tinymce-react";
import {
  apiUpdateProject,
  apiGetProjectList,
} from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;

const UpdateProjectForm = ({ owner, project, onUpdate, onClose }) => {
  const [form] = Form.useForm();
  const editorRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(true);

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
          placement: "bottomRight",
        });
      }
    };

    fetchProjects();
  }, [project, form]);

  const handleFieldChange = (_, allValues) => {
    const currentTitle = allValues.title?.trim() || "";
    const currentDescription = form.getFieldValue("description")?.trim() || "";
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
      const descriptionText =
        editorRef.current?.getContent({ format: "text" }).trim() || "";

      if (!descriptionText) {
        message.error("Description cannot be empty");
        return;
      }

      const duplicate = allProjects.some(
        (p) =>
          p.title.trim() === values.title.trim() &&
          p.owner === owner &&
          p.id !== project.id
      );

      if (duplicate) {
        notification.error({
          message: "Error",
          description:
            "Another project with this title already exists for this owner.",
          placement: "bottomRight",
        });
        return;
      }

      setSubmitting(true);
      try {
        await apiUpdateProject(project.id, {
          title: values.title.trim(),
          description: descriptionText,
          plain_description: descriptionText,
          owner_id: project.owner_id,
        });

        notification.success({
          message: "Success",
          description: "Project updated successfully",
          placement: "bottomRight",
        });

        onUpdate?.();
        form.resetFields();
        onClose?.();
      } catch (err) {
        notification.error({
          message: "Error",
          description: "Failed to update project",
          placement: "bottomRight",
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
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFieldChange}
      >
        <Form.Item
          label={<span className="font-semibold">Title:</span>}
          name="title"
          rules={[
            { required: true, message: "Please enter a project title" },
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.reject(
                    "Title cannot be empty or whitespace"
                  );
                }
                if (
                  !/^[A-Za-z0-9\s\-_,\.;:()]+$/.test(value.trim())
                ) {
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

        <Form.Item label={<span className="font-semibold">Description:</span>}>
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
            initialValue={
              typeof project?.description === "string"
                ? project.description
                : ""
            }
            onInit={(evt, editor) => {
              editorRef.current = editor;
            }}
            onEditorChange={() => {
              const text =
                editorRef.current?.getContent({ format: "text" }) || "";
              form.setFieldsValue({ description: text });
              handleFieldChange(null, form.getFieldsValue());
            }}
            init={{
              height: 200,
              menubar: false,
              placeholder: "Enter project description here...",
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
              telemetry: false,
            }}
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
