import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/GuestPage/Login/Login";
import SignIn from "../pages/GuestPage/Signin/SignIn";
import ChangeProfile from "../pages/GeneralPage/ChangeProfile/ChangeProfile";
import ChangePassword from "../pages/GeneralPage/ChangePassword/ChangePassword";
import { useAuth } from "../context/useAuth";
import PrivateRoutes from "./PrivateRoutes";
import { ADMIN, USER } from "../constants/role.constants";
import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import { CHANGE_PASSWORD, CHANGE_PROFILE, DASHBOARD, LOGIN, SIGNUP } from "../constants/routes.constants";
import UserDashboard from "../pages/UsersPage/UserDashboard/UserDashboard";
import AdminDashboard from "../pages/AdminPage/AdminDashboard/AdminDashboard";

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
            <SignIn />
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
        path={CHANGE_PROFILE}
        element={
          <PrivateRoutes allowedRoles={[ADMIN, USER]}>
            <ChangeProfile />
          </PrivateRoutes>
        }
      />
      <Route
        path={CHANGE_PASSWORD}
        element={
          <PrivateRoutes allowedRoles={[ADMIN, USER]}>
            <ChangePassword />
          </PrivateRoutes>
        }
      />
    </Routes>
  );
}

export default AppRoutes;