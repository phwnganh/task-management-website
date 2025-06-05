// import { API } from "../../constants/api.constants";

// export const SignUpService = async (payload) => {
//   try {
//     const res = await fetch(`${API.USER_URI}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       const errorData = await res.json();
//       throw new Error(errorData.message || "Failed to sign up");
//     }

//     const user = await res.json();
//     console.log("User signed up successfully:", user);
//     return user;
//   } catch (error) {
//     console.error("Signup error:", error);
//     throw new Error(error.message || "Network error");
//   }
// };

import { API } from "../../constants/api.constants";

export const SignUpService = async (payload) => {
  try {
    // Gửi yêu cầu tạo user mới
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

    // Lấy user vừa tạo
    const newUser = await res.json();
    console.log("User created:", newUser);

    // Gọi GET để lấy danh sách user đầy đủ
    const usersRes = await fetch(`${API.USER_URI}`);
    if (!usersRes.ok) {
      throw new Error("Failed to fetch user list");
    }
    const users = await usersRes.json();
    return users; // Trả về mảng các user
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Network error");
  }
};
