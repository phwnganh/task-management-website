import { API } from "../../constants/api.constants";
import axios from "axios";
export const apiGetUserProfile = async (userId) => {
  try {
    const res = await fetch(`${API.USER_URI}/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to render user profile");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
export const apiChangeAvatar = async (userId, avatarUrl) => {
  try {
    const res = await fetch(`${API.USER_URI}/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_url: avatarUrl, // Base64 string for the static image
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to update avatar: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update avatar");
  }
};
export const updateUserProfile = async (userId, data) => {
  const response = await axios.put(`${API.USER_URI}/${userId}`, data);
  return response.data;
};

export const apiChangePassword = async (
  userId,
  { currentPassword, newPassword }
) => {
  try {
    const getUser = await axios.get(`${API.USER_URI}/${userId}`);
    const user = getUser.data;

    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }
    if (currentPassword === newPassword) {
      throw new Error(
        "New password must be different from the current password"
      );
    }

    const response = await axios.patch(`${API.USER_URI}/${userId}`, {
      password: newPassword,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to change password"
    );
  }
};
