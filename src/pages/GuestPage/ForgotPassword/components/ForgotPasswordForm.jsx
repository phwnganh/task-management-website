import { Form, Input, Button, Space, notification } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../../constants/routes.constants";
import {
  apiCheckEmailExists,
  apiResetPasswordByEmail,
} from "../../../../services/GuestService/GuestService";

const ForgotPasswordForm = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập password mới
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

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
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                  message:
                    "Password must contain at least 1 letter and 1 number",
                },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
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
