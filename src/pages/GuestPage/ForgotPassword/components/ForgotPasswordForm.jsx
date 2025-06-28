import {
  Form,
  Input,
  Button,
  Space,
  notification,
  Progress,
  Modal,
} from "antd";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../../constants/routes.constants";
import {
  apiCheckEmailExists,
  apiResetPasswordByEmail,
} from "../../../../services/GuestService/GuestService";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("forgotPW");
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
        message: t("Not Found"),
        description: t("Email not found!"),
        placement: "bottomRight",
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
        message: t("Mismatch"),
        description: t("Passwords do not match."),
        placement: "bottomRight",
      });
      return;
    }

    Modal.confirm({
      title: t("Confirm Password Change"),
      content: t("Are you sure you want to update your password?"),
      okText: t("Yes, Change It"),
      cancelText: t("Cancel"),
      centered: true,
      onOk: async () => {
        try {
          await apiResetPasswordByEmail(email, password);
          notification.success({
            message: t("Success"),
            description: t("Password updated! Please login again."),
            placement: "bottomRight",
          });
          navigate(LOGIN);
        } catch (error) {
          notification.error({
            message: "Error",
            description: error.message || t("Could not reset password"),
            placement: "bottomRight",
          });
        }
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        {t("Forgot Password")}
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
            label={
              <span className="text-gray-700 font-medium">{t("Email")}</span>
            }
            rules={[
              { required: true, message: t("Please enter your email") },
              { type: "email", message: t("Please enter a valid email") },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$/,
                message: t("Email must be @gmail.com or @hotmail.com"),
              },
            ]}
          >
            <Input placeholder={t("Enter your email")} />
          </Form.Item>
        ) : (
          <>
            <Form.Item
              name="password"
              label={
                <span className="text-gray-700 font-medium">
                  {t("New Password")}
                </span>
              }
              rules={[
                { required: true, message: t("Please enter a new password") },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_:;<>|"'~\/{}\[\]+=\\\-?.,])[A-Za-z\d!@#$%^&*()_:;<>|"'~\/{}\[\]+=\\\-?.,]{8,}$/,
                  message: t(
                    "Password must be at least 8 characters, include upper, lower, number, special"
                  ),
                },
              ]}
              hasFeedback
            >
              <Input.Password placeholder={t("Enter new password")} />
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
                  {passwordStrength
                    ? t(`strength.${passwordStrength.toLowerCase()}`)
                    : ""}
                </span>
              </div>
            )}
            <Form.Item
              name="confirm_password"
              label={
                <span className="text-gray-700 font-medium">
                  {t("Confirm New Password")}
                </span>
              }
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: t("Please confirm your new password"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t("Passwords do not match!"))
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder={t("Confirm new password")} />
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
              {step === 1 ? t("Verify Email") : t("Change Password")}
            </Button>
            <p className="text-center text-sm">
              {t("Remembered?")}{" "}
              <a href={LOGIN} className="text-indigo-600 hover:text-indigo-900">
                {t("Login")}
              </a>
            </p>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
