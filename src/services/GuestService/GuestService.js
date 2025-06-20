import { API } from "../../constants/api.constants";

export const apiLogin = async (email, password) => {
  try {
    const res = await fetch(
      `${API.USER_URI}?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`,
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
      throw new Error(
        "Multiple users found with the same email. Contact support."
      );
    }

    // Use the single user
    const user = users[0];

    // Validate user data
    if (!user.email || !user.id) {
      throw new Error("Invalid user data returned from server.");
    }

    if (user.status === "Inactive") {
      throw new Error(
        "Your account is inactive. Please contact the administrator."
      );
    }
    // Assign default role if none exists
    return { ...user, role: user.role || "User" };
  } catch (error) {
    throw new Error(error.message || "Error to login!");
  }
};

export const apiSignUp = async (payload) => {
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

    // const newUser = await res.json();
    // console.log("User created:", newUser);
    // return newUser; // Trả về user mới (không cần trả danh sách toàn bộ)
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Network error");
  }
};

// Kiểm tra email có tồn tại
export const apiCheckEmailExists = async (email) => {
  // json-server trả về array khi dùng ?email
  const res = await fetch(`${API.USER_URI}?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to check email!");
  const data = await res.json();
  return data.length > 0; // true nếu tìm thấy user
};

// Đổi mật khẩu bằng email
export const apiResetPasswordByEmail = async (email, newPassword) => {
  // 1. Tìm user trước
  const res = await fetch(`${API.USER_URI}?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch user for reset password!");
  const data = await res.json();
  if (data.length === 0) throw new Error("Email not found!");
  const user = data[0];

  // 2. PATCH password
  const res2 = await fetch(`${API.USER_URI}/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res2.ok) throw new Error("Failed to update password!");
  return await res2.json();
};

/** Fetch toàn bộ user */
export const fetchUsers = async () => {
  const res = await fetch(`${API.USER_URI}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
};

/** Tạo user mới */
export const createUser = async (userData) => {
  const res = await fetch(`${API.USER_URI}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Unable to create new user");
  return await res.json();
};

/** Lấy thông tin từ Google token */
export const fetchGoogleUserInfo = async (idToken) => {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );
  if (!res.ok) throw new Error("Invalid Google token");
  return await res.json();
};
