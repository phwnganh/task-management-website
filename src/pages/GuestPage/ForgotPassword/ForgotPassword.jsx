import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout FormComponent={ForgotPasswordForm} />
    </div>
  );
};

export default ForgotPassword;
