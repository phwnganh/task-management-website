import {
  Form,
  Input,
  Button,
  Space,
  message,
  Progress,
  notification,
  Modal,
} from "antd";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../../constants/routes.constants";
import { v4 as uuidv4 } from "uuid";
import { apiSignUp } from "../../../../services/GuestService/GuestService";
import { useTranslation } from "react-i18next";

const SignUpForm = () => {
  const { t } = useTranslation("signup");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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

    if (score <= 2) return "password.weak";
    if (score === 3 || score === 4) return "password.medium";
    if (score === 5) return "password.strong";
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
      is_archived: false,
      ...cleanedValues,
      created_at: new Date().toISOString(),
    };

    Modal.confirm({
      title: t("Confirm Registration"),
      content: t("Are you sure you want to create this account?"),
      okText: t("Yes"),
      cancelText: t("No"),
      centered: true,
      onOk: async () => {
        setLoading(true);
        try {
          await apiSignUp(fullPayload);
          notification.success({
            message: t("Success"),
            description: t("Signup successful! Redirecting to login..."),
            placement: "bottomRight",
          });
          navigate(LOGIN);
        } catch (err) {
          notification.error({
            message: t("Error"),
            description: err.message,
            placement: "bottomRight",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStrengthPercent = (level) => {
    switch (level) {
      case "password.weak":
        return 30;
      case "password.medium":
        return 60;
      case "password.strong":
        return 100;
      default:
        return 0;
    }
  };

  const getStrengthStrokeColor = (level) => {
    switch (level) {
      case "password.weak":
        return "#ef4444"; // red
      case "password.medium":
        return "#facc15"; // yellow
      case "password.strong":
        return "#16a34a"; // green
      default:
        return "#d1d5db"; // gray
    }
  };

  // Render password strength component
  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    return (
      <div className="mt-2">
        <Progress
          percent={getStrengthPercent(passwordStrength)}
          strokeColor={getStrengthStrokeColor(passwordStrength)}
          showInfo={true}
          format={() => (passwordStrength ? t(passwordStrength) : "")}
          strokeWidth={8}
          trailColor="#f0f0f0"
          className="rounded-lg"
        />
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        {t("Create an Account")}
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
              <span className="text-gray-700 font-medium">
                {t("First Name")}
              </span>
            }
            rules={[
              { required: true, message: t("Please enter your first name") },
              { pattern: /^\S+$/, message: t("No spaces allowed") },
            ]}
          >
            <Input placeholder={t("Enter your first name")} />
          </Form.Item>

          <Form.Item
            name="last_name"
            label={
              <span className="text-gray-700 font-medium">
                {t("Last Name")}
              </span>
            }
            rules={[
              { required: true, message: t("Please enter your last name") },
              { pattern: /^\S+$/, message: t("No spaces allowed") },
            ]}
          >
            <Input placeholder={t("Enter your last name")} />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span className="text-gray-700 font-medium">{t("Email")}</span>
            }
            rules={[
              { required: true, message: t("Please enter your email") },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$/,
                message: t("Email must be @gmail.com | @hotmail.com"),
              },
            ]}
          >
            <Input placeholder={t("Enter your email")} />
          </Form.Item>

          <Form.Item
            name="confirm_email"
            label={
              <span className="text-gray-700 font-medium">
                {t("Confirm Email")}
              </span>
            }
            dependencies={["email"]}
            rules={[
              { required: true, message: t("Please confirm your email") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("email") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("Email does not match")));
                },
              }),
            ]}
          >
            <Input placeholder={t("Enter your confirmation email")} />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span className="text-gray-700 font-medium">{t("Password")}</span>
            }
            rules={[
              { required: true, message: t("Please enter a password") },
              {
                pattern:
                  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_:;<>|"'~\/\\{}\[\]+=\\\-?.,])[^\s]{8,}$/,
                message: t(
                  "Password has at least 8 characters, 1 letter, 1 number, 1 special character, and no space."
                ),
              },
            ]}
          >
            <div className="flex flex-col">
              <Input.Password
                placeholder={t("Enter your password")}
                autoComplete="new-password"
                className="mb-0" // Remove default margin to control spacing manually
              />
              {renderPasswordStrength()}
            </div>
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label={
              <span className="text-gray-700 font-medium">
                {t("Confirm Password")}
              </span>
            }
            dependencies={["password"]}
            rules={[
              { required: true, message: t("Please confirm your password") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("Password does not match"))
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={t("Enter your confirmation password")}
            />
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
              {loading ? "Creating..." : t("Get started")}
            </Button>
            <p className="text-center text-sm">
              {t("Already have an account?")}{" "}
              <a
                href="/login"
                className="text-indigo-600 hover:text-indigo-900"
              >
                {t("Log in")}
              </a>
            </p>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUpForm;
