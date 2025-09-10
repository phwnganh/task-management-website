import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import LoginForm from "./components/LoginForm";
// import MapOSMOut from "../../../mapOSM/components/MapOSMOut";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation("login");
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      {/* 📝 Form đăng nhập */}
      <PreLoginLayout
        FormComponent={LoginForm}
        title={t("Login To Your Account")}
        subtitle={t("Welcome back! Please enter your credentials!")}
      />

      {/* 🗺️ Bản đồ địa chỉ công ty */}
      {/* <p className="text-xl font-semibold text-gray-800 mt-8 mb-2 uppercase tracking-wide">
        {t("Company Address")}
      </p> */}

      {/* <MapOSMOut /> */}
    </div>
  );
};

export default Login;
