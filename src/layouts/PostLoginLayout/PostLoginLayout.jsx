import Header from "./Header";
import SideBar from "./SideBar";

const PostLoginLayout = ({ children, hideSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {!hideSidebar && <SideBar />}
        <main className="flex-1 pt-16 lg:pl-72 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostLoginLayout;
