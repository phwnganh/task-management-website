import { API, BASE_SERVER } from "../../constants/uri.constants";

export const apiLogin = async (email, password) => {
  try {
    const res = await fetch(`${API.USER_URI}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error('Failed to login!');
    }
    const user = await res.json()

    if (user.length === 0) {
      throw new Error('The email or password is incorrect.');
    }
    return user[0];
  } catch (error) {
       throw new Error(error.message || 'Error to login!');
  }
};
