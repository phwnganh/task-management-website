import { API } from "../../constants/api.constants";

export const SignUpService = async (payload) => {
  try {
    const res = await fetch(`${API.USER_URI}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to sign up");
    }

    const user = await res.json();
    console.log("User signed up successfully:", user);
    return user;
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Network error");
  }
};
