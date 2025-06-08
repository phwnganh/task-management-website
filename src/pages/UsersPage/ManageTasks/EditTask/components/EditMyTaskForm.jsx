import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { Form, Input, Typography } from "antd";
import { Editor } from "@tinymce/tinymce-react";

const { Title } = Typography;

const EditMyTaskForm = forwardRef(({ initialValues }, ref) => {
  const [form] = Form.useForm();
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getFormValues: () => {
      return {
        ...form.getFieldsValue(),
        description: editorRef.current?.getContent() || "",
      };
    },
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || "",
        description: initialValues.description || "",
      });
    }
  }, [initialValues, form]);

  return (
    <div className="p-8 rounded-2xl shadow min-w-[340px] bg-white">
      <Title level={3} className="!mb-6 !text-black">
        View My Task Detail
      </Title>
      <Form form={form} layout="vertical">
        <Form.Item label="Title:" name="title">
          <Input placeholder="Enter title..." />
        </Form.Item>

        <Form.Item label="Description:" name="description">
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue={initialValues?.description || ""}
            init={{
              height: 200,
              menubar: false,
              placeholder: "Enter task description...",
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
              content_style:
                "body { font-family:Roboto,sans-serif;font-size:14px }",
            }}
            onEditorChange={(content) => {
              form.setFieldsValue({ description: content });
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
});

export default EditMyTaskForm;
