import { Button, Form, Input, notification, Space } from "antd";
import { useAuth } from "../../../../context/useAuth";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DASHBOARD, SIGNUP } from "../../../../constants/routes.constants";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from "@react-oauth/google";
import { v4 as uuidv4 } from "uuid";
import {
  fetchUsers,
  createUser,
  fetchGoogleUserInfo,
} from "../../../../services/GuestService/GuestService";
import { useTranslation } from "react-i18next";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 0, span: 24 },
};

const LoginForm = () => {
  const { t } = useTranslation("login");
  const { login, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const navigate = useNavigate();

  const onSubmit = async (values) => {
    if (!recaptchaToken) {
      notification.warning({
        message: t("reCAPTCHA Required"),
        description: t("Please verify you are not a robot."),
        placement: "bottomRight",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = await login(values.email, values.password);
      notification.success({
        message: t("Success"),
        description: t("Login successfully!"),
        placement: "bottomRight",
      });
      navigate(DASHBOARD);
    } catch (error) {
      notification.error({
        message: t("Error"),
        description: error.message,
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = await fetchGoogleUserInfo(credential);

      const {
        email,
        given_name: first_name,
        family_name: last_name,
        picture: avatar_url,
      } = decoded;

      const newUser = {
        id: uuidv4(),
        first_name,
        last_name,
        email,
        password: "",
        role: "User",
        position: "",
        date_of_birth: "",
        phone_number: "",
        address: "",
        avatar_url,
        status: "Active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const users = await fetchUsers();
      const existing = users.find((u) => u.email === email);

      let userToSave;
      if (!existing) {
        userToSave = await createUser(newUser);
      } else {
        userToSave = existing;
      }

      localStorage.setItem("user", JSON.stringify(userToSave));
      updateUser(userToSave);

      notification.success({
        message: t("Login Successful"),
        description: t("Sign in with Google successful!"),
        placement: "bottomRight",
      });

      navigate(DASHBOARD);
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("Google Login Failed"),
        description: err.message || t("Error getting information from Google"),
      });
    }
  };

  return (
    <Form
      form={form}
      onFinish={onSubmit}
      layout="vertical"
      className="mx-auto mt-8 text-center"
    >
      <div style={{ width: 320, margin: "0 auto" }}>
        <Form.Item
          name="email"
          label={
            <span className="text-gray-700 font-medium">{t("Email")}</span>
          }
          rules={[
            { required: true, message: t("Please enter your email") },
            { type: "email", message: t("Please enter a valid email") },
            {
              pattern: /^[a-zA-Z0-9._%+-]+@(g|hot)mail\.com$/,
              message: t("Email must be @gmail.com or @hotmail.com"),
            },
          ]}
        >
          <Input type="email" placeholder={t("Enter your email")} />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span className="text-gray-700 font-medium">{t("Password")}</span>
          }
          rules={[{ required: true, message: t("Please enter your password") }]}
        >
          <Input.Password placeholder={t("Enter your password")} />
        </Form.Item>

        <div className="text-left -mt-2 mb-4">
          <a
            href="/forgot-password"
            className="text-indigo-500 hover:underline text-sm"
          >
            {t("Forgot password?")}
          </a>
        </div>

        <Form.Item className="text-center">
          <div
            style={{
              transform: "scale(0.9)",
              transformOrigin: "0 0",
            }}
          >
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              // sitekey="6LezE2UrAAAAAFTDhMbfrwF75rtcEYqxlEbrTXkf" key thật
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
              ref={(el) => (recaptchaRef.current = el)}
            />
          </div>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{
            width: "100%",
            height: "40px",
            fontWeight: "bold",
          }}
          className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 mb-2"
        >
          {loading ? "Logging in..." : t("Login")}
        </Button>

        <div className="text-gray-500 my-2 font-medium">{t("OR")}</div>

        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() =>
            notification.error({
              message: t("Google Login Failed"),
              description: t("Unable to login with Google"),
            })
          }
          useOneTap
          scope="openid email profile"
          theme="outline"
          size="medium"
          text="signin_with"
        />

        <div className="text-center pt-4">
          <p className="text-sm">
            {t("Don’t have an account?")}{" "}
            <a href={SIGNUP} className="text-indigo-600 hover:text-indigo-900">
              {t("Sign up")}
            </a>
          </p>
        </div>
      </div>
    </Form>
  );
};

export default LoginForm;
