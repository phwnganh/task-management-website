import { Form, Input, Button, Space, notification, Progress } from "antd";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../../constants/routes.constants";
import {
  apiCheckEmailExists,
  apiResetPasswordByEmail,
} from "../../../../services/GuestService/GuestService";

// Hàm kiểm tra strength (phục vụ thanh Progress)
const checkPasswordStrength = (password) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_:;<>|"'~\/{}\[\]+=\\\-?.,]/.test(password)) score++;
  if (score <= 2) return "Weak";
  if (score === 3 || score === 4) return "Medium";
  if (score === 5) return "Strong";
  return null;
};
const getStrengthPercent = (level) => {
  switch (level) {
    case "Weak":
      return 30;
    case "Medium":
      return 60;
    case "Strong":
      return 100;
    default:
      return 0;
  }
};
const getStrengthStrokeColor = (level) => {
  switch (level) {
    case "Weak":
      return "#ef4444";
    case "Strong":
      return "#16a34a";
    default:
      return "#d1d5db";
  }
};

const ForgotPasswordForm = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập password mới
  const [email, setEmail] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  // Theo dõi trường password, debounce đánh giá độ mạnh
  const passwordValue = Form.useWatch("password", form);
  useEffect(() => {
    const timer = setTimeout(() => {
      setPasswordStrength(checkPasswordStrength(passwordValue));
    }, 150);
    return () => clearTimeout(timer);
  }, [passwordValue]);

  // Bước 1: Kiểm tra email
  const handleCheckEmail = async ({ email }) => {
    const exists = await apiCheckEmailExists(email);
    if (!exists) {
      notification.error({
        message: "Not Found",
        description: "Email not found!",
      });
    } else {
      setEmail(email);
      setStep(2);
    }
  };

  // Bước 2: Đặt lại mật khẩu
  const handleChangePassword = async ({ password, confirm_password }) => {
    if (password !== confirm_password) {
      notification.error({
        message: "Mismatch",
        description: "Passwords do not match.",
      });
      return;
    }
    await apiResetPasswordByEmail(email, password);
    notification.success({
      message: "Success",
      description: "Password updated! Please login again.",
    });
    navigate(LOGIN);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        Forgot Password
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={step === 1 ? handleCheckEmail : handleChangePassword}
        className="space-y-6"
      >
        {step === 1 ? (
          <Form.Item
            name="email"
            label={<span className="text-gray-700 font-medium">Email</span>}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$/,
                message: "Email must be @gmail.com or @hotmail.com",
              },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
        ) : (
          <>
            <Form.Item
              name="password"
              label={
                <span className="text-gray-700 font-medium">New Password</span>
              }
              rules={[
                { required: true, message: "Please enter a new password" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_:;<>|"'~\/{}\[\]+=\\\-?.,])[A-Za-z\d!@#$%^&*()_:;<>|"'~\/{}\[\]+=\\\-?.,]{8,}$/,
                  message:
                    "Password must be at least 8 characters, include upper, lower, number, special",
                },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
            {passwordValue && (
              <div className="mt-1">
                <Progress
                  percent={getStrengthPercent(passwordStrength)}
                  strokeColor={getStrengthStrokeColor(passwordStrength)}
                  showInfo={false}
                  strokeWidth={8}
                  trailColor="#f0f0f0"
                  className="rounded-lg"
                />
                <span
                  style={{
                    color:
                      passwordStrength === "Strong"
                        ? "#16a34a"
                        : passwordStrength === "Medium"
                        ? "#facc15"
                        : "#ef4444",
                  }}
                  className="ml-2 font-medium"
                >
                  {passwordStrength ? passwordStrength : ""}
                </span>
              </div>
            )}
            <Form.Item
              name="confirm_password"
              label={
                <span className="text-gray-700 font-medium">
                  Confirm New Password
                </span>
              }
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
          </>
        )}

        <Form.Item className="text-center">
          <Space direction="vertical" size="middle" className="w-full">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 h-10"
            >
              {step === 1 ? "Verify Email" : "Change Password"}
            </Button>
            <p className="text-center text-sm">
              Remembered?{" "}
              <a href={LOGIN} className="text-indigo-600 hover:text-indigo-900">
                Login
              </a>
            </p>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
