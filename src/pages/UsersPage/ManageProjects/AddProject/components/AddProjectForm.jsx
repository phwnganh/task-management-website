import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Typography, message, notification } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import {apiCreateProject} from "../../../../../services/UserService/ManageProjectsService";

const { Title } = Typography;

const AddProjectForm = ({ owner, onCreate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const editorRef = useRef(null);
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const plainText = editorRef.current
          .getContent({ format: "text" })
          .trim();

        if (!plainText) {
          message.error("Description cannot be empty");
          return;
        }

        const duplicate = allProjects.some(
          (project) =>
            project.title.trim() === values.title.trim() &&
            project.owner_id === owner.id
        );

        if (duplicate) {
          message.error("Project title already exists for this owner");
        } else {
          setSubmitting(true);
          try {
            const payload = {
              title: values.title.trim(),
              description: plainText,
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
            editorRef.current?.setContent("");
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
          />
        </Form.Item>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            onClick={() => {
              form.resetFields();
              editorRef.current?.setContent("");
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
