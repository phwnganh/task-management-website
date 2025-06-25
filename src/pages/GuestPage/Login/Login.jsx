import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import LoginForm from "./components/LoginForm";
import MapOSMOut from "../../../mapOSM/components/MapOSMOut";
import sidebarPic from "../../../assets/b.gif";

const Login = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      {/* 🐱 Ảnh động ở góc trái */}
      <div className="fixed top-4 left-4 z-50">
        <img
          src={sidebarPic}
          alt="Funny Cat"
          className="w-24 h-24 object-contain animate-bounce"
        />
      </div>

      {/* 📝 Form đăng nhập */}
      <PreLoginLayout
        FormComponent={LoginForm}
        title="Login To Your Account"
        subtitle="Welcome back! Please enter your credentials!"
      />

      {/* 🗺️ Bản đồ địa chỉ công ty */}
      <p className="text-xl font-semibold text-gray-800 mt-8 mb-2 uppercase tracking-wide">
        Company Address
      </p>

      <MapOSMOut />
    </div>
  );
};

export default Login;
