import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import {
  apiCreateProject,
  apiGetProjectList,
} from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;

const AddProjectForm = ({ owner, onCreate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const editorRef = useRef(null); // Keeps TinyMCE reference

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        message.error("Failed to fetch project list");
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const duplicate = allProjects.some(
          (project) => project.title === values.title && project.owner_id === owner.id
        );

        if (duplicate) {
          message.error("Project title already exists for this owner");
        } else {
          setSubmitting(true);
          try {
            const plainText = editorRef.current.getContent({ format: "text" }); 

            const payload = {
              title: values.title,
              description: plainText, 
              owner_id: owner.id,
            };

            await apiCreateProject(payload);
            message.success("Project created successfully");
            onCreate(payload);
            form.resetFields();
            onClose();
          } catch (error) {
            message.error("Failed to create project");
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
      <Title level={2}>Create New Project</Title>
      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="font-semibold">Title:</span>}
          name="title"
          rules={[{ required: true, message: "Please enter a project title" }]}
        >
          <Input placeholder="Enter project title" className="w-1/2" />
        </Form.Item>

        <Form.Item label={<span className="font-semibold">Description:</span>}>
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
            init={{
              height: 200,
              menubar: false,
              placeholder: "Enter project description",
              plugins: [
                "advlist", "autolink", "lists", "link", "image",
                "charmap", "preview", "anchor", "help",
                "searchreplace", "visualblocks", "code",
                "insertdatetime", "media", "table", "wordcount"
              ],
              toolbar:
                "undo redo | formatselect | bold italic | " +
                "alignleft aligncenter alignright | " +
                "bullist numlist outdent indent | help",
            }}
            onInit={(evt, editor) => (editorRef.current = editor)}
          />
        </Form.Item>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            onClick={() => {
              form.resetFields();
              editorRef.current?.setContent(""); // ✅ Clears TinyMCE
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
