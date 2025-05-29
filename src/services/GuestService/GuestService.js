import { API } from "../../constants/api.constants";

export const apiLogin = async (email, password) => {
  try {
    const res = await fetch(
      `${API.USER_URI}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to login!");
    }

    const users = await res.json();

    if (!users || users.length === 0) {
      throw new Error("The email or password is incorrect.");
    }

    // Select the first user with a role, or default to the first user with role set to "User"
    const user = users.find((u) => u.role) || { ...users[0], role: "User" };
    return user;
  } catch (error) {
    throw new Error(error.message || "Error to login!");
  }
};