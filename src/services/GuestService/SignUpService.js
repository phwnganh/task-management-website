import { API } from "../../constants/api.constants";

export const SignUpService = async (payload) => {
  try {
    // 1. Kiểm tra xem email đã tồn tại chưa
    const checkEmailRes = await fetch(`${API.USER_URI}?email=${payload.email}`);
    if (!checkEmailRes.ok) {
      throw new Error("Failed to check existing email");
    }

    const existingUsers = await checkEmailRes.json();
    if (existingUsers.length > 0) {
      throw new Error("Email already exists");
    }

    // 2. Gửi yêu cầu tạo user mới nếu email chưa tồn tại
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

    const newUser = await res.json();
    console.log("User created:", newUser);
    return newUser; // Trả về user mới (không cần trả danh sách toàn bộ)
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Network error");
  }
};
