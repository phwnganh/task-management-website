import { Avatar } from "antd";
import { useAuth } from "../../context/useAuth";
import { UserOutlined } from "@ant-design/icons";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center px-4 md:px-6 lg:pl-72 bg-white shadow-md">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            Hi, {user.first_name} {user.last_name}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar
              src={user.avatar_url}
              alt=""
              icon={!user.avatar_url && <UserOutlined />}
              className="h-8 w-8 rounded-full"
            />
            <div className="hidden md:block ml-2">
              <p className="text-sm font-medium text-gray-800">
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
