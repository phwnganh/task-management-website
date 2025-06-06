import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import SignUpForm from "./components/SignUpForm";

const SignUp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout FormComponent={SignUpForm} />
    </div>
  );
};

export default SignUp;
