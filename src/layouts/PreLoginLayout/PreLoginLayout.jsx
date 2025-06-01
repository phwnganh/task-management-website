import LayoutImage from "../../assets/layouts.jpg";
const PreLoginLayout = ({ FormComponent, title, subtitle }) => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm lg:px-8">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl">
        <div className="w-full lg:w-1/2 p-8 sm:p-10">
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {title}
            </h1>
            <h4 className="text-md font-medium text-gray-600">
              {subtitle}
            </h4>
          </div>
          <FormComponent />
        </div>
        <div className="hidden lg:block w-1/2">
          <img
            src={LayoutImage}
            alt="Website Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default PreLoginLayout;
