import { Button, Form, Input, notification, Space } from "antd";
import { useAuth } from "../../../../context/useAuth";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DASHBOARD, SIGNUP } from "../../../../constants/routes.constants";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 0, span: 24 },
};

const LoginForm = () => {
  const { login, updateUser } = useAuth(); // ✅ thêm updateUser
  const [form] = Form.useForm();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const navigate = useNavigate();

  const onSubmit = async (values) => {
    if (!recaptchaToken) {
      notification.warning({
        message: "reCAPTCHA Required",
        description: "Please verify you are not a robot.",
        placement: "bottomRight",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = await login(values.email, values.password);
      notification.success({
        message: "Success",
        description: "Login successfully!",
        placement: "bottomRight",
      });
      navigate(DASHBOARD);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message,
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  // const onReset = () => {
  //   form.resetFields();
  //   setEmail("");
  //   setPassword("");
  //   setRecaptchaToken(null);
  //   if (recaptchaRef.current) {
  //     recaptchaRef.current.reset();
  //   }
  // };
  const onReset = () => {
    form.resetFields();
    setRecaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      const resToken = await fetch(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential
      );
      const decoded = await resToken.json();

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

      const res = await fetch("http://localhost:9999/users");
      const users = await res.json();
      const existing = users.find((u) => u.email === email);

      let userToSave;
      if (!existing) {
        const createRes = await fetch("http://localhost:9999/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        if (!createRes.ok) throw new Error("Không thể tạo người dùng mới");
        userToSave = newUser;
      } else {
        userToSave = existing;
      }

      localStorage.setItem("user", JSON.stringify(userToSave));
      updateUser(userToSave); // ✅ cập nhật context

      notification.success({
        message: "Login Successful",
        description: "Đăng nhập bằng Google thành công!",
        placement: "bottomRight",
      });

      navigate(DASHBOARD); // chuyển sang dashboard
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Google Login Failed",
        description: err.message || "Lỗi khi lấy thông tin từ Google",
      });
    }
  };

  return (
    <Form
      {...layout}
      form={form}
      onFinish={onSubmit}
      className="space-y-6"
      layout="vertical"
      // initialValues={{ email: "", password: "" }}
    >
      {/* <Form.Item
        name="email"
        label={<span className="text-gray-700 font-medium">Email</span>}
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Please enter a valid email" },
          {
            pattern: /^[a-zA-Z0-9._%+-]+@(g|hot)mail\.com$/,
            message: "Email must be @gmail.com or @hotmail.com",
          },
        ]}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </Form.Item> */}
      <Form.Item
        name="email"
        label={<span className="text-gray-700 font-medium">Email</span>}
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Please enter a valid email" },
          {
            pattern: /^[a-zA-Z0-9._%+-]+@(g|hot)mail\.com$/,
            message: "Email must be @gmail.com or @hotmail.com",
          },
        ]}
      >
        <Input type="email" placeholder="Enter your email" />
      </Form.Item>

      {/* <Form.Item
        name="password"
        label={<span className="text-gray-700 font-medium">Password</span>}
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input type="password" placeholder="Enter your password" />
        <div className="mt-2 text-right">
          <a
            href="/forgot-password"
            className="text-indigo-500 hover:underline text-sm"
          >
            Forgot password?
          </a>
        </div>
      </Form.Item> */}

      <Form.Item
        name="password"
        label={<span className="text-gray-700 font-medium">Password</span>}
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input type="password" placeholder="Enter your password" />
      </Form.Item>

      <div className="w-full text-left -mt-2 mb-4">
        <a
          href="/forgot-password"
          className="text-indigo-500 hover:underline text-sm"
        >
          Forgot password?
        </a>
      </div>

      <Form.Item className="text-center">
        <div style={{ transform: "scale(0.85)", transformOrigin: "0 0" }}>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            onChange={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
            ref={recaptchaRef}
          />
        </div>
      </Form.Item>

      <Form.Item {...tailLayout} className="text-center">
        <Space size="large" direction="vertical" className="w-full">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 h-10"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button
              htmlType="button"
              onClick={onReset}
              className="ml-2 border-gray-300 hover:border-gray-400 transition-colors duration-200 h-10"
            >
              Reset
            </Button>
          </Space>

          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() =>
              notification.error({
                message: "Google Login Failed",
                description: "Unable to login with Google",
              })
            }
            useOneTap
            scope="openid email profile"
            width="250"
            theme="outline"
            size="medium"
            text="signin_with"
          />

          <div className="text-center mr-12">
            <p>
              Don't have an account?{" "}
              <a
                href={SIGNUP}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Sign up
              </a>
            </p>
          </div>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
