import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import LoginForm from "./components/LoginForm";

const Login = () => {
  return (
    <>
      <PreLoginLayout FormComponent={LoginForm} />
    </>
  );
};

export default Login;
