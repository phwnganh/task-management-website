import { API } from "../../constants/api.constants";

export const apiGetLabelList = async (owner_id) => {
  try {
    const res = await fetch(`${API.LABEL_URI}?created_by=${owner_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch label list!`);
    }
    const labels = await res.json();
    console.log("labels in api service: ", labels);

    return labels && Array.isArray(labels)
      ? labels
      : Array.isArray(labels)
      ? labels
      : [];
  } catch (error) {
    throw new Error(error.message);
  }
};
