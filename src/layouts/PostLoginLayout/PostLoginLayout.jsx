import Header from "./Header";
import SideBar from "./SideBar";

const PostLoginLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <div className="flex flex-1">
        <SideBar />
        <main className="flex-1 p-4 md:p-6 lg:pl-72 pt-20 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostLoginLayout;
