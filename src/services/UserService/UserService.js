import axios from "axios";
import { BASE_SERVER } from "../../constants/api.constants";

export const updateUserProfile = async (userId, data) => {
  const response = await axios.put(`${BASE_SERVER}/users/${userId}`, data);
  return response.data;
};

