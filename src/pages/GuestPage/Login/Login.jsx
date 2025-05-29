import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import LoginForm from "./components/LoginForm";

const Login = () => {
  return (
    <>
    <div>
      <h1 className="font-bold">Login To Your Accountt</h1>
      <h4>Welcome back! Please enter your credentials!</h4>
    </div>
      <PreLoginLayout FormComponent={LoginForm} />
    </>
  );
};

export default Login;
