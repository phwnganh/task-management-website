import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/GuestPage/Login/Login";
import SignUp from "../pages/GuestPage/Signup/SignUp";
import { useAuth } from "../context/useAuth";
import PrivateRoutes from "./PrivateRoutes";
import { ADMIN, USER } from "../constants/role.constants";
import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import {
  DASHBOARD,
  LABEL_LIST,
  LOGIN,
  MANAGE_USER_LIST,
  MY_PROFILE,
  NOTIFICATION_LIST,
  PROJECT_LIST,
  SETTINGS,
  SIGNUP,
} from "../constants/routes.constants";
import ViewMyProfile from "../pages/GeneralPage/ViewMyProfile/ViewMyProfile";
import Settings from "../pages/GeneralPage/Settings/Settings";
import ProjectList from "../pages/UsersPage/ManageProjects/ProjectList";
import TaskList from "../pages/UsersPage/ManageTasks/TaskList";
import LabelList from "../pages/UsersPage/ManageLabels/LabelList";
import ManageTaskOverview from "../pages/UsersPage/ManageTasks/ManageTaskOverview";
import NotificationList from "../pages/UsersPage/Notifications/NotificationList";
import UserOverviewDashboard from "../pages/UsersPage/UserDashboard/UserOverviewDashboard";
import AdminOverviewDashboard from "../pages/AdminPage/AdminDashboard/AdminOverviewDashboard";
import UserList from "../pages/AdminPage/ManageUsers/UserList";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Route gốc: Điều hướng dựa trên trạng thái đăng nhập */}
      <Route
        path="/"
        element={
          user.role ? (
            <Navigate to={DASHBOARD} replace />
          ) : (
            <Navigate to={LOGIN} replace />
          )
        }
      />

      {/* Các route công khai (chỉ dành cho người chưa đăng nhập) */}
      <Route
        path={LOGIN}
        element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        }
      />
      <Route
        path={SIGNUP}
        element={
          <PublicRoutes>
            <SignUp />
          </PublicRoutes>
        }
      />

      {/* Role-based dashboard routing */}
      <Route
        path={DASHBOARD}
        element={
          <ProtectedRoutes>
            {user.role === ADMIN ? (
              <AdminOverviewDashboard />
            ) : (
              <UserOverviewDashboard />
            )}
          </ProtectedRoutes>
        }
      />
      <Route
        path={SETTINGS}
        element={
          <PrivateRoutes allowedRoles={[ADMIN, USER]}>
            <Settings />
          </PrivateRoutes>
        }
      />
      <Route
        path={MY_PROFILE}
        element={
          <PrivateRoutes allowedRoles={[ADMIN, USER]}>
            <ViewMyProfile />
          </PrivateRoutes>
        }
      />
      <Route
        path={PROJECT_LIST}
        element={
          <PrivateRoutes allowedRoles={[USER]}>
            <ProjectList />
          </PrivateRoutes>
        }
      />
      <Route
        path={`${PROJECT_LIST}/:projectId`}
        element={
          <PrivateRoutes allowedRoles={[USER]}>
            <ManageTaskOverview />
          </PrivateRoutes>
        }
      />
      <Route
        path={LABEL_LIST}
        element={
          <PrivateRoutes allowedRoles={[USER]}>
            <LabelList />
          </PrivateRoutes>
        }
      />
      <Route
        path={NOTIFICATION_LIST}
        element={
          <PrivateRoutes allowedRoles={[USER]}>
            <NotificationList />
          </PrivateRoutes>
        }
      />
      <Route
        path={MANAGE_USER_LIST}
        element={
          <PrivateRoutes allowedRoles={[ADMIN]}>
            <UserList />
          </PrivateRoutes>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
