import { createContext, useState } from "react";
import { apiLogin } from "../services/GuestService/GuestService";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    console.log("Initial user from localStorage:", savedUser);
    return savedUser ? JSON.parse(savedUser) : { role: null };
  });

  const login = async (email, password) => {
    try {
      console.log("Attempting login with email:", email, "password:", password);
      const userData = await apiLogin(email, password);
      console.log("userData:", userData);
      if (!userData || !userData.role) {
        throw new Error("User data does not contain a role.");
      }
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData)); // Save to localStorage on login
      console.log("Saving to localStorage:", userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser({ role: null });
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };