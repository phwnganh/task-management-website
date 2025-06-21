import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import SignUpForm from "./components/SignUpForm";
import MapOSM from "../Login/components/MapOSM";

const SignUp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout FormComponent={SignUpForm} />
      <p className="text-xl font-semibold text-gray-800 mt-8 mb-2 uppercase tracking-wide">
        Company Address
      </p>
      <MapOSM />
    </div>
  );
};

export default SignUp;
