import Header from "./Header";
import SideBar from "./SideBar";

const PostLoginLayout = ({ children}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <main className="flex-1 pt-16 pl-16 lg:pl-72 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostLoginLayout;
