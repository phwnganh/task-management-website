import axios from "axios";
import { API } from "../../constants/api.constants";

export const updateUserProfile = async (userId, data) => {
  const response = await axios.put(`${API.USER_URI}/${userId}`, data);
  return response.data;
};

