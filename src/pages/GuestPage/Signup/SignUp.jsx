import PreLoginLayout from "../../../layouts/PreLoginLayout/PreLoginLayout";
import SignUpForm from "./components/SignUpForm";
// import MapOSMOut from "../../../mapOSM/components/MapOSMOut";
import { useTranslation } from "react-i18next";

const SignUp = () => {
  const { t } = useTranslation("login");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PreLoginLayout FormComponent={SignUpForm} />
      {/* <p className="text-xl font-semibold text-gray-800 mt-8 mb-2 uppercase tracking-wide">
        {t("Company Address")}
      </p>
      <MapOSMOut /> */}
    </div>
  );
};

export default SignUp;
