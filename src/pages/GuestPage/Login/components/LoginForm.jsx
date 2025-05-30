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
  wrapperCol: { offset: 0, span: 24 },
};
const LoginForm = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const userData = await login(values.email, values.password);
      alert("Login successfully!");
      navigate(DASHBOARD);
      console.log("Login successful, userData:", userData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
      className="space-y-6"
      layout="vertical"
      initialValues={{ email: "", password: "" }}
    >
      <Form.Item
        name="email"
        label={<span className="text-gray-700 font-medium">Email</span>}
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
        label={<span className="text-gray-700 font-medium">Password</span>}
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
          <Button type="primary" htmlType="submit" loading={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 h-10">
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button htmlType="button" onClick={onReset} className="ml-2 border-gray-300 hover:border-gray-400 transition-colors duration-200 h-10">
            Reset
          </Button>
        </Space>
        <div className="text-center mt-4 mr-10" wrapperCol={layout.wrapperCol}>
          <p>Don't have an account?&nbsp;<span><a href="#" className="text-indigo-600 hover:text-indigo-900 text-sm">Sign up</a></span></p>
        </div>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
