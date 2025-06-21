import { createContext, useState, useCallback, useMemo } from "react";
import { apiLogin } from "../services/GuestService/GuestService";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    console.log("Initial user from localStorage:", savedUser);
    return savedUser ? JSON.parse(savedUser) : { role: null };
  });

  const login = useCallback(async (email, password) => {
    try {
      console.log("Attempting login with email:", email, "password:", password);
      const userData = await apiLogin(email, password);
      console.log("userData:", userData);
      if (!userData || !userData.role) {
        throw new Error("User data does not contain a role.");
      }
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("Saving to localStorage:", userData);
      return userData;
    } catch (error) {
      throw error;
    }
  }, []); // No dependencies, as it only uses setUser and apiLogin

  const logout = useCallback(() => {
    setUser({ role: null });
    localStorage.removeItem("user");
  }, []); // No dependencies

  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []); // No dependencies

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
    }),
    [user, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };