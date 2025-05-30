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

    if (users.length > 1) {
      throw new Error("Multiple users found with the same email. Contact support.");
    }

    // Use the single user
    const user = users[0];

    // Validate user data
    if (!user.email || !user.id) {
      throw new Error("Invalid user data returned from server.");
    }

    // Assign default role if none exists
    return { ...user, role: user.role || "User" };
  } catch (error) {
    throw new Error(error.message || "Error to login!");
  }
};