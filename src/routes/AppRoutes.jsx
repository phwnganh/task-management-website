import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/GuestPage/Login/Login";
import SignUp from "../pages/GuestPage/Signup/SignUp";
import { useAuth } from "../context/useAuth";
import PrivateRoutes from "./PrivateRoutes";
import { ADMIN, USER } from "../constants/role.constants";
import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import {DASHBOARD, LOGIN, MY_PROFILE, SETTINGS, SIGNUP } from "../constants/routes.constants";
import UserDashboard from "../pages/UsersPage/UserDashboard/UserDashboard";
import AdminDashboard from "../pages/AdminPage/AdminDashboard/AdminDashboard";
import ViewMyProfile from "../pages/GeneralPage/ViewMyProfile/ViewMyProfile";
import Settings from "../pages/GeneralPage/Settings/Settings";

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
            {user.role === ADMIN ? <AdminDashboard /> : <UserDashboard />}
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
    </Routes>
  );
}

export default AppRoutes;