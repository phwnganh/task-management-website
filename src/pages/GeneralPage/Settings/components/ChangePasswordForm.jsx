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

  const isGoogleAccount = user?.password === "";

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
        return "#f5222d";
      case t("passwordStrengthMedium"):
        return "#faad14";
      case t("passwordStrengthStrong"):
        return "#52c41a";
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

        {isGoogleAccount ? (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-md border border-yellow-300">
            <strong>⚠️ Note:</strong> This account is signed in with Google. You
            cannot change your password.
          </div>
        ) : (
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="grid grid-cols-1 gap-y-4 sm:gap-y-6"
            initialValues={{ email: user?.email }}
          >
            <Form.Item
              label={
                <span className="text-gray-700 font-medium">
                  {t("emailLabel")}
                </span>
              }
              name="email"
            >
              <Input disabled className="bg-gray-100" />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-gray-700 font-medium">
                  {t("currentPasswordLabel")}
                </span>
              }
              rules={[
                { required: true, message: t("currentPasswordRequired") },
              ]}
            >
              <Input.Password placeholder={t("currentPasswordLabel")} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={
                <span className="text-gray-700 font-medium">
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
            >
              <Input.Password
                placeholder={t("newPasswordLabel")}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
            </Form.Item>

            {passwordStrength && (
              <div>
                <Progress
                  percent={getStrengthPercent(passwordStrength)}
                  strokeColor={getStrengthStrokeColor(passwordStrength)}
                  showInfo={false}
                />
                <p className="mt-1 text-sm text-gray-600">
                  {t("passwordStrengthLabel")}:{" "}
                  <strong>{passwordStrength}</strong>
                </p>
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              label={
                <span className="text-gray-700 font-medium">
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
            >
              <Input.Password placeholder={t("confirmPasswordLabel")} />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex flex-col md:flex-row justify-end items-end gap-2">
                <Button onClick={handleCancel} className="w-full md:w-auto">
                  {t("cancelButton")}
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} className="w-full md:w-auto">
                  {t("saveButton")}
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </div>
    </Spin>
  );
};

export default ChangePasswordForm;
