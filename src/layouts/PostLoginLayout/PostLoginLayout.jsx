import Header from "./Header";
import SideBar from "./SideBar";

const PostLoginLayout = ({ children, hideSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 relative">
        {!hideSidebar && <SideBar />}

        <main
          className={`flex-1 pt-[64px] min-h-[calc(100vh-64px)] ${
            !hideSidebar ? "lg:pl-72" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostLoginLayout;
