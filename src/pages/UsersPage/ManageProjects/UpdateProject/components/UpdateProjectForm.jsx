import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import {
  apiGetProjectList,
  apiUpdateProject,
} from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;

const UpdateProjectForm = ({ owner, project, onUpdate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const editorRef = useRef(null);

  const originalTitle = project?.title || "";
  const originalDescription =
    typeof project?.description === "string" ? project.description : "";

  useEffect(() => {
    form.setFieldsValue({
      title: originalTitle,
      description: originalDescription,
    });

    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        message.error("Failed to fetch project list");
      }
    };
    fetchProjects();
  }, [form, project]);

  const handleFieldChange = (_, allValues) => {
    const currentTitle = allValues.title?.trim() || "";
    const currentDescription = editorRef.current?.getContent({ format: "text" })?.trim() || "";

    const originalDescriptionText = editorRef.current?.dom?.decode(originalDescription)?.trim() || "";

    const titleChanged = currentTitle !== originalTitle.trim();
    const descriptionChanged = currentDescription !== originalDescriptionText;

    setIsModified(titleChanged || descriptionChanged);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const duplicate = allProjects.some(
          (p) =>
            p.title === values.title && p.owner === owner && p.id !== project.id
        );

        if (duplicate) {
          message.error("Another project with this title already exists for this owner");
        } else {
          setSubmitting(true);
          try {
            const plainTextDescription =
              editorRef.current?.getContent({ format: "text" }) || "";

            await apiUpdateProject(project.id, {
              ...values,
              description: plainTextDescription,
              owner_id: project.owner_id,
            });

            message.success("Project updated successfully");
            onUpdate();
            form.resetFields();
            onClose();
          } catch (error) {
            message.error("Failed to update project");
          } finally {
            setSubmitting(false);
          }
        }
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

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
          rules={[{ required: true, message: "Please enter a project title" }]}
        >
          <Input placeholder="Enter project title" className="w-1/2" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">Description:</span>}
          name="description"
        >
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
            init={{
              height: 200,
              menubar: false,
              plugins: [
                "advlist", "autolink", "lists", "link", "image", "charmap",
                "preview", "anchor", "help", "searchreplace", "visualblocks",
                "code", "insertdatetime", "media", "table", "wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic | " +
                "alignleft aligncenter alignright | " +
                "bullist numlist outdent indent | help",
                telemetry: false,
            }}
            onInit={(evt, editor) => {
              editorRef.current = editor;
              editor.setContent(originalDescription);
            }}
            onEditorChange={() => {
              const htmlContent = editorRef.current.getContent();
              form.setFieldsValue({ description: htmlContent });
              handleFieldChange(null, form.getFieldsValue());
            }}
          />
        </Form.Item>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            onClick={() => {
              form.setFieldsValue({
                title: originalTitle,
                description: originalDescription,
              });
              if (editorRef.current) {
                editorRef.current.setContent(originalDescription);
              }
              setIsModified(false);
            }}
          >
            Reset
          </Button>
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
