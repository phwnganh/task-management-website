import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import LoginForm from "./components/LoginForm";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout FormComponent={LoginForm} title={"Login To Your Account"} subtitle={"Welcome back! Please enter your credentials!"}/>
    </div>
  );
};

export default Login;
