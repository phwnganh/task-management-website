import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/GuestPage/Login/Login";
import SignIn from "../pages/GuestPage/Signin/SignIn";
import ChangeProfile from "../pages/GeneralPage/ChangeProfile/ChangeProfile";
import ChangePassword from "../pages/GeneralPage/ChangePassword/ChangePassword";
import { useAuth } from "../context/useAuth";
import PrivateRoutes from "./PrivateRoutes";
import { ADMIN, USER } from "../constants/role.constants";
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<SignIn />} />
      <Route
        path="/change-profile"
        element={
          <PrivateRoutes allowedRoles={[ADMIN, USER]}>
            <ChangeProfile />
          </PrivateRoutes>
        }
      />
      <Route
        path="/change-password"
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
