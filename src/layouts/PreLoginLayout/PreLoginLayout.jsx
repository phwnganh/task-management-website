const PreLoginLayout = ({FormComponent}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex w-full max-w-4xl bg-white">
        <div className="w-1/2 p-8">
        <FormComponent/>
        </div>
        <div className="w-1/2">
          <img
            src="https://via.placeholder.com/600x800"
            alt="Website Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default PreLoginLayout;
