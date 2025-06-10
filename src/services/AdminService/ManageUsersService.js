import { API } from "../../constants/api.constants";

export const apiGetUserList = async () => {
  try {
    const res = await fetch(`${API.USER_URI}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user list!`);
    }
    const users = await res.json();
    console.log("users in api service: ", users);

    return users && Array.isArray(users)
      ? users
      : Array.isArray(users)
      ? users
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};