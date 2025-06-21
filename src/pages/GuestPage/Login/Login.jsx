import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import LoginForm from "./components/LoginForm";
import MapOSM from "../Login/components/MapOSM";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout
        FormComponent={LoginForm}
        title={"Login To Your Account"}
        subtitle={"Welcome back! Please enter your credentials!"}
      />
      <p className="text-xl font-semibold text-gray-800 mt-8 mb-2 uppercase tracking-wide">
        Company Address
      </p>

      <MapOSM />
    </div>
  );
};

export default Login;
