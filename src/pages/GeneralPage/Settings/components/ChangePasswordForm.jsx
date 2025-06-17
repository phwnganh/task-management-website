import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Progress,
  Spin,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import { apiChangePassword } from "../../../../services/GeneralService/GeneralSerice";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
const ChangePasswordForm = () => {
  const { t } = useTranslation("changepwuser");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordValue, setPasswordValue] = useState("");
  const { user, updateUser } = useAuth();

  // Hàm đánh giá độ mạnh mật khẩu
  const checkPasswordStrength = useCallback(
    (password) => {
      if (!password) return null;

      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      if (score <= 2) return t("passwordStrengthWeak");
      if (score === 3 || score === 4) return t("passwordStrengthMedium");
      if (score === 5) return t("passwordStrengthStrong");
      return null;
    },
    [t]
  );

  // Debounce 150ms để tính độ mạnh
  useEffect(() => {
    const timer = setTimeout(() => {
      if (passwordValue) {
        setPasswordStrength(checkPasswordStrength(passwordValue));
      } else {
        setPasswordStrength(null);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [passwordValue, checkPasswordStrength]);

  const getStrengthPercent = (strength) => {
    switch (strength) {
      case t("passwordStrengthWeak"):
        return 33;
      case t("passwordStrengthMedium"):
        return 66;
      case t("passwordStrengthStrong"):
        return 100;
      default:
        return 0;
    }
  };

  const getStrengthStrokeColor = (strength) => {
    switch (strength) {
      case t("passwordStrengthWeak"):
        return "#f5222d"; // red
      case t("passwordStrengthMedium"):
        return "#faad14"; // yellow
      case t("passwordStrengthStrong"):
        return "#52c41a"; // green
      default:
        return "#d9d9d9";
    }
  };

  const onFinish = async (values) => {
    Modal.confirm({
      title: t("confirmModalTitle"),
      content: t("confirmModalMessage"),
      okText: t("yesButton"),
      cancelText: t("noButton"),
      okButtonProps: { className: "h-10 w-20 sm:w-24" },
      cancelButtonProps: { className: "h-10 w-20 sm:w-24" },
      onOk: async () => {
        setLoading(true);
        try {
          const updatedUser = await apiChangePassword(user.id, {
            currentPassword: values.password,
            newPassword: values.newPassword,
          });

          notification.success({
            message: "Success",
            description: t("updateSuccess"),
            placement: "bottomRight",
          });
          updateUser(updatedUser);
          form.resetFields();
          setPasswordStrength(null);
          setPasswordValue("");
        } catch (error) {
          notification.error({
            message: "Error",
            description: t("updateFail"),
            placement: "bottomRight",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setPasswordValue("");
    setPasswordStrength(null);
  };

  return (
    <Spin
      spinning={loading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="flex flex-col p-4 sm:p-6 max-w-4xl w-full rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-start">
          {t("changePasswordTitle")}
        </h3>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="grid grid-cols-1 gap-y-4 sm:gap-y-6"
          initialValues={{ email: user?.email }}
        >
          <Form.Item
            label={
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {t("emailLabel")}
              </span>
            }
            name="email"
            className="flex flex-col"
          >
            <Input
              placeholder={t("newPasswordRequired")}
              disabled
              className="rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm sm:text-base"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {t("currentPasswordLabel")}
              </span>
            }
            rules={[{ required: true, message: t("currentPasswordRequired") }]}
            className="flex flex-col"
          >
            <Input.Password
              placeholder={t("currentPasswordLabel")}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm sm:text-base"
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {t("newPasswordLabel")}
              </span>
            }
            rules={[
              { required: true, message: t("newPasswordRequired") },
              {
                pattern:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: t("newPasswordValidation"),
              },
            ]}
            className="flex flex-col"
          >
            <Input.Password
              placeholder={t("newPasswordLabel")}
              onChange={(e) => setPasswordValue(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm sm:text-base"
            />
          </Form.Item>
          {passwordStrength && (
            <div className="mt-2">
              <Progress
                percent={getStrengthPercent(passwordStrength)}
                strokeColor={getStrengthStrokeColor(passwordStrength)}
                showInfo={false}
                strokeWidth={8}
                trailColor="#f0f0f0"
                className="rounded-lg"
              />
              <div
                className={`text-xs sm:text-sm mt-1 transition-colors duration-200 ${
                  passwordStrength === t("passwordStrengthWeak")
                    ? "text-red-500"
                    : passwordStrength === t("passwordStrengthMedium")
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                Password strength: {passwordStrength}
              </div>
            </div>
          )}
          <Form.Item
            name="confirmPassword"
            label={
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {t("confirmPasswordLabel")}
              </span>
            }
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: t("confirmPasswordRequired") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("passwordMismatch")));
                },
              }),
            ]}
            className="flex flex-col"
          >
            <Input.Password
              placeholder={t("confirmPasswordLabel")}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm sm:text-base"
            />
          </Form.Item>
          <Form.Item className="flex justify-end mb-0">
            <Button
              onClick={handleCancel}
              className="px-4 sm:px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition mr-2 sm:mr-4 h-10 w-24 sm:w-28"
            >
              {t("cancelButton")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="px-4 sm:px-6 py-2 rounded-md h-10 w-24 sm:w-28 bg-blue-600 hover:bg-blue-700"
            >
              {t("saveButton")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default ChangePasswordForm;
