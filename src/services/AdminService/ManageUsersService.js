import { API } from "../../constants/api.constants";
import { USER } from "../../constants/role.constants";

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

export const apiGetAllUserWithoutAdminList = async () => {
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

    const filterUsers = users.filter((user) => user.role === USER);
    return filterUsers && Array.isArray(filterUsers)
      ? filterUsers
      : Array.isArray(filterUsers)
      ? filterUsers
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const apiGetUserDetail = async (userId) => {
  try {
    const res = await fetch(`${API.USER_URI}/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user detail for ID: ${userId}`);
    }
    const user = await res.json();
    console.log(`User detail for ${userId}: `, user);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
