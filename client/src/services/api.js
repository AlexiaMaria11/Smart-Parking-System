const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("smart-parking-token");

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = json?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return json;
}
