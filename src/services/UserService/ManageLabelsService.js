import { API } from "../../constants/api.constants"

export const apiGetLabelList = async (owner_id) => {
  try {
    console.log('Calling API:', `${API.LABEL_URI}?created_by=${owner_id}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s
    const res = await fetch(`${API.LABEL_URI}?created_by=${owner_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log('Response status:', res.status, res.statusText);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch label list: ${res.status} ${res.statusText} - ${errorText}`);
    }
    const labels = await res.json();
    console.log('Labels from API:', labels);
    return Array.isArray(labels) ? labels : [];
  } catch (error) {
    console.error('API error:', error.message, error);
    throw new Error(`Error fetching labels: ${error.message}`);
  }
};