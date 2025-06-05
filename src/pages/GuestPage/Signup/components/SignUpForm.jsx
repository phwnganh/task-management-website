import { Form, Input, Button, Space, message } from "antd";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../../constants/routes.constants";
import { SignUpService } from "../../../../services/GuestService/apiSignUp";
import { v4 as uuidv4 } from "uuid";

const SignUpForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Sử dụng useCallback để tránh re-render không cần thiết
  const checkPasswordStrength = useCallback((password) => {
    if (!password) return null;

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    if (score === 5) return "Strong";
    return null;
  }, []);

  // Sử dụng Form.useWatch nhưng với debounce để tránh nhảy
  const passwordValue = Form.useWatch("password", form);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (passwordValue) {
        setPasswordStrength(checkPasswordStrength(passwordValue));
      } else {
        setPasswordStrength(null);
      }
    }, 150); // Debounce 150ms

    return () => clearTimeout(timer);
  }, [passwordValue, checkPasswordStrength]);

  const onSubmit = async (values) => {
    const { confirm_email, confirm_password, ...cleanedValues } = values;

    const fullPayload = {
      id: uuidv4(),
      role: "User",
      status: "Active",
      ...cleanedValues,
      created_at: new Date().toISOString(),
    };

    setLoading(true);
    try {
      await SignUpService(fullPayload);
      messageApi.success("Signup successful! Redirecting to login...");
      navigate(LOGIN);
    } catch (err) {
      messageApi.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Render password strength component
  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    const colorClass =
      passwordStrength === "Weak"
        ? "text-red-500"
        : passwordStrength === "Medium"
        ? "text-yellow-500"
        : "text-green-600";

    return (
      <div className={`text-sm mt-1 ${colorClass}`}>
        Password strength: {passwordStrength}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {contextHolder}
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        Create an Account
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="space-y-6"
        preserve={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="first_name"
            label={
              <span className="text-gray-700 font-medium">First Name</span>
            }
            rules={[
              { required: true, message: "Please enter your first name" },
              { pattern: /^\S+$/, message: "No spaces allowed" },
            ]}
          >
            <Input placeholder="Enter your first name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label={<span className="text-gray-700 font-medium">Last Name</span>}
            rules={[
              { required: true, message: "Please enter your last name" },
              { pattern: /^\S+$/, message: "No spaces allowed" },
            ]}
          >
            <Input placeholder="Enter your last name" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-gray-700 font-medium">Email</span>}
            rules={[
              { required: true, message: "Please enter your email" },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$/,
                message: "Email must be @gmail.com | @hotmail.com",
              },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="confirm_email"
            label={
              <span className="text-gray-700 font-medium">Confirm Email</span>
            }
            dependencies={["email"]}
            rules={[
              { required: true, message: "Please confirm your email" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("email") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Emails do not match"));
                },
              }),
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-gray-700 font-medium">Password</span>}
            rules={[
              { required: true, message: "Please enter a password" },
              {
                pattern:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_:;<>|"'~\/\\{}\[\]+=\\\-?.,])[^\s]{8,}$/,
                message:
                  "At least 8 characters, 1 letter, 1 number, 1 special character, no space",
              },
            ]}
          >
            <div>
              <Input.Password
                placeholder="12345678a."
                autoComplete="new-password"
              />
              {passwordStrength && (
                <div
                  className={`text-sm mt-1 transition-colors duration-200 ${
                    passwordStrength === "Weak"
                      ? "text-red-500"
                      : passwordStrength === "Medium"
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordStrength === "Weak"
                          ? "bg-red-500"
                          : passwordStrength === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                    ></span>
                    Password strength: {passwordStrength}
                  </span>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label={
              <span className="text-gray-700 font-medium">
                Confirm Password
              </span>
            }
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Enter your re password" />
          </Form.Item>
        </div>

        <Form.Item className="text-center">
          <Space direction="vertical" size="middle" className="w-full">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 h-10"
            >
              {loading ? "Creating..." : "Get started"}
            </Button>
            <p className="text-center text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-indigo-600 hover:text-indigo-900"
              >
                Log in
              </a>
            </p>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUpForm;
