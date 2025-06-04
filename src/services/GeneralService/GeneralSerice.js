import { API } from "../../constants/api.constants";

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
