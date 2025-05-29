import { Button, Form, Input, Space } from "antd";
import { useAuth } from "../../../../context/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DASHBOARD } from "../../../../constants/routes.constants";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
const LoginForm = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    try {
      const userData = await login(values.email, values.password);
      alert("Login successfully!");
      navigate(DASHBOARD);
      console.log("Login successful, userData:", userData);
    } catch (error) {
      setError(error.message);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEmail("");
    setPassword("");
    setError(null);
  };
  return (
    <Form
      {...layout}
      form={form}
      onFinish={onSubmit}
      style={{ maxWidth: 600 }}
      initialValues={{ email: "", password: "" }}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Please enter a valid email" },
        ]}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </Form.Item>
      {error && (
        <Form.Item {...tailLayout}>
          <span style={{ color: "red" }}>{error}</span>
        </Form.Item>
      )}
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
