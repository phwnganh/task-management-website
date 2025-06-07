import  { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Editor } from '@tinymce/tinymce-react';
import { apiGetProjectList, apiCreateProject } from "../../../../../services/UserService/UserService";

const { Title } = Typography;

const AddProjectForm = ({ owner, onCreate, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        message.error('Failed to fetch project list');
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = () => {
    form.validateFields()
      .then(async values => {
        const duplicate = allProjects.some(
          project => project.title === values.title && project.owner === owner
        );

        if (duplicate) {
          message.error('Project title already exists for this owner');
        } else {
          setSubmitting(true);
          try {
            await apiCreateProject({ ...values, description: editorContent, owner });
            message.success('Project created successfully');
            onCreate({ ...values, description: editorContent, owner });
            form.resetFields();
            setEditorContent('');
            onClose();
          } catch (error) {
            message.error('Failed to create project');
          } finally {
            setSubmitting(false);
          }
        }
      })
      .catch(info => {
        console.log('Validation Failed:', info);
      });
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <Title level={2}>Create New Project</Title>
      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="font-semibold">Title:</span>}
          name="title"
          rules={[{ required: true, message: 'Please enter a project title' }]}
        >
          <Input placeholder="Enter project title" className="w-1/2" />
        </Form.Item>

        <Form.Item label={<span className="font-semibold">Description:</span>}>
          <Editor
            apiKey="9kozl63t56pl9pu61k3lozb5escczn7p6hmqoryofm0nq2p7" 
            value={editorContent}
            init={{
              height: 200,
              menubar: false,
              placeholder: 'Enter project description',
              plugins: [
                'advlist autolink lists link image',
                'charmap print preview anchor help',
                'searchreplace visualblocks code',
                'insertdatetime media table paste wordcount'
              ],
              toolbar:
                'undo redo | formatselect | bold italic | \
                alignleft aligncenter alignright | \
                bullist numlist outdent indent | help'
            }}
            onEditorChange={(content) => setEditorContent(content)}
          />
        </Form.Item>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button onClick={() => { form.resetFields(); setEditorContent(''); }}>Reset</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddProjectForm;



