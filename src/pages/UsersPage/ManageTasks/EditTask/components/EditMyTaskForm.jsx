import React, { useState } from "react";
import { Form, Input, Typography } from "antd";
import { Editor } from "@tinymce/tinymce-react";

const { Title } = Typography;

const EditMyTaskForm = React.forwardRef(
  ({ initialValues = {}, onChange }, ref) => {
    const [editorContent, setEditorContent] = useState(
      initialValues.description || ""
    );
    const [form] = Form.useForm();

    React.useImperativeHandle(ref, () => ({
      getFormValues: () => ({
        ...form.getFieldsValue(),
        description: editorContent,
      }),
      resetForm: () => {
        form.resetFields();
        setEditorContent(initialValues.description || "");
      },
    }));

    return (
      <div className="p-8 rounded-2xl shadow min-w-[340px] bg-white">
        <Title level={3} className="!mb-6 !text-black">
          Update Member Task
        </Title>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ title: initialValues.title || "" }}
          onValuesChange={onChange}
        >
          <Form.Item label="Title:" name="title">
            <Input placeholder="Enter title..." />
          </Form.Item>
          <Form.Item label="Description:">
            <Editor
              apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7"
              value={editorContent}
              onEditorChange={setEditorContent}
              init={{
                height: 220,
                menubar: false,
                plugins: [
                  "advlist autolink lists link image",
                  "charmap print preview anchor help",
                  "searchreplace visualblocks code",
                  "insertdatetime media table paste wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic | " +
                  "alignleft aligncenter alignright | " +
                  "bullist numlist outdent indent | help",
              }}
            />
          </Form.Item>
        </Form>
      </div>
    );
  }
);

export default EditMyTaskForm;
