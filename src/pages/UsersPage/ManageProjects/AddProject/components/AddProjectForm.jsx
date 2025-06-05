// import { Form, Typography, Modal, Input, Button, Row, Col } from "antd";
// import { useState } from "react";
// const { Title } = Typography;
// const AddProjectForm = ({ visible, onCancel }) => {
//   //   const CreateProjectModal = () => {
//   //     const [isModalOpen, setIsModalOpen] = useState(false);
//   //     const [form] = Form.useForm();
//   //     const [description, setDescription] = useState("");

//   //     const showModal = () => {
//   //       setIsModalOpen(true);
//   //     };

//   //     const handleCreate = () => {
//   //       form
//   //         .validateFields()
//   //         .then((values) => {
//   //           console.log("Project Created:", { ...values, description });
//   //           setIsModalOpen(false);
//   //           form.resetFields();
//   //           setDescription("");
//   //         })
//   //         .catch((info) => {
//   //           console.log("Validation Failed:", info);
//   //         });
//   //     };
//   //   };
//   const [form] = Form.useForm();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");

//   const handleCreate = () => {
//     form.validateFields().then((values) => {
//       console.log("Submitted:", { ...values, description });
//       form.resetFields();
//       setDescription("");
//       onCancel(); // close modal
//     });
//   };

//   const handleReset = () => {
//     form.resetFields();
//     setTitle("");
//     setDescription("");
//   };

//   //   const handleSubmit = (e) => {
//   //     e.preventDefault(); // prevents page reload
//   //     console.log("Submitted:", { name, email });
//   //   };

//   return (
//     <>
//       <Modal open={visible} onCancel={onCancel} width={900} footer={null}>
//         <Form form={form}>
//           <Title level={2}>Create New Project</Title>
//           <div>
//             <Form.Item
//               label="Title:"
//               name="title"
//               rules={[
//                 { required: true, message: "Please Enter the Project's Title" },
//               ]}
//               onFinish={handleCreate}
//             ></Form.Item>
//             <Input placeholder="example" />
//           </div>
//           <div>
//             <Form.Item label="Description:"></Form.Item>
//             <Input.TextArea/>
//           </div>

//           <Form.Item>
//             <Row gutter={16} justify="end" className="mt-6">
//               <Col>
//                 <Button onClick={handleReset}>Reset</Button>
//               </Col>
//               <Col>
//                 <Button type="primary"  onClick={handleCreate}>
//                   Create
//                 </Button>
//               </Col>
//             </Row>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// export default AddProjectForm;

import React, { useState, useContext } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { AuthContext } from '../../../../../context/AuthContext'; 

const { TextArea } = Input;

export default function AddProjectForm({ visible, onClose }) {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      message.error('Title is required');
      return;
    }

    if (!user) {
      message.error('You must be logged in to create a project.');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('projects') || '[]');

    const isDuplicate = existing.some(
      (project) =>
        project.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        project.ownerId === user.id
    );

    if (isDuplicate) {
      message.error('You already have a project with this title.');
      return;
    }

    const newProject = {
      id: crypto.randomUUID(),
      title,
      description,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('projects', JSON.stringify([...existing, newProject]));

    message.success('Project created!');
    resetForm();
    onClose();
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold">Create Project</span>}
      open={visible}
      onCancel={() => {
        resetForm();
        onClose();
      }}
      footer={null} 
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            placeholder="Enter project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <TextArea
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="rounded-md"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} className="bg-gray-100">
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}

