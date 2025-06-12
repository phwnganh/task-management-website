import { API } from "../../constants/api.constants";

export const apiGetLabelList = async (created_by) => {
  try {
    const res = await fetch(`${API.LABEL_URI}?created_by=${created_by}`, {
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

export const apiGetPublicLabelList = async (created_by) => {
  try {
    const res = await fetch(`${API.LABEL_URI}?created_by=${created_by}&is_public=true`, {
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

export const apiCreateLabel = async (label) => {
  try {
    const res = await fetch(API.LABEL_URI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(label),
    });
    if (!res.ok) {
      throw new Error("Failed to create label!");
    }
    return await res.json();
  } catch (error) {
    throw new Error(error.message);
  }
};