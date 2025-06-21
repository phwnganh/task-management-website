import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import MapOSM from "../../../mapOSM/components/MapOSM";

const ForgotPassword = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout FormComponent={ForgotPasswordForm} />
      <p className="text-xl font-semibold text-gray-800 mt-8 mb-2 uppercase tracking-wide">
        Company Address
      </p>
      <MapOSM />
    </div>
  );
};

export default ForgotPassword;
