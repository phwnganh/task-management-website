import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  DASHBOARD,
  LOGIN,
  MY_PROFILE,
  PROJECT_LIST,
  SETTINGS,
} from "../../constants/routes.constants";
import { Modal } from "antd";
import { USER } from "../../constants/role.constants";

const SideBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hiển thị modal xác nhận
    Modal.confirm({
      title: "Confirm to logout",
      content: "Are you sure to logout?",
      okText: "OK",
      cancelText: "Cancel",
      onOk: () => {
        logout(); // Gọi hàm logout khi nhấn OK
        navigate(LOGIN); // Chuyển hướng đến trang login
      },
      onCancel: () => {
        // Không làm gì khi nhấn Hủy
      },
    });
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-16 lg:w-64 text-black bg-white shadow-md transition-all duration-300 z-30">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-bold lg:text-2xl">OrbitTasks</span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 flex flex-col mt-4">
          <NavLink
            to={DASHBOARD}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-black hover:bg-blue-400 hover:text-white ${
                isActive ? "bg-blue-400 text-white" : ""
              }`
            }
          >
            <svg
              className="h-6 w-6 lg:mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
            <span className="hidden lg:block">Dashboard</span>
          </NavLink>
          {user.role === USER && (
            <NavLink
              to={PROJECT_LIST}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-black hover:bg-blue-400 hover:text-white ${
                  isActive ? "bg-blue-400 text-white" : ""
                }`
              }
            >
              <svg
                className="h-6 w-6 lg:mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9-4h-2m0 0H7a2 2 0 00-2 2v2m9 0h2m0 0h2a2 2 0 012-2V5a2 2 0 00-2-2h-2m-6 9h6"
                ></path>
              </svg>
              <span className="hidden lg:block">Project</span>
            </NavLink>
          )}
          <NavLink
            to={SETTINGS}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-black hover:bg-blue-400 hover:text-white ${
                isActive ? "bg-blue-400 text-white" : ""
              }`
            }
          >
            <svg
              className="h-6 w-6 lg:mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
              ></path>
            </svg>
            <span className="hidden lg:block">Setting</span>
          </NavLink>
        </nav>
        {/* User Profile and Logout */}
        <div className="border-t border-gray-200">
          <div className="flex items-center px-4 py-3">
            <img
              src={user.avatar_url}
              alt="Profile"
              className="h-8 w-8 rounded-full lg:mr-3"
            />
            <div className="hidden lg:block">
              <Link
                to={MY_PROFILE}
                className="text-sm font-medium hover:text-blue-400"
              >
                {user.first_name} {user.last_name}
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-black hover:bg-blue-400 hover:text-white w-full text-left"
          >
            <svg
              className="h-6 w-6 lg:mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
