const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("annapurna_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  profile: () => request("/profile"),
  updateProfile: (payload) => request("/profile", { method: "PUT", body: JSON.stringify(payload) }),
  restaurants: (search = "") => request(`/restaurants${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  restaurant: (id) => request(`/restaurants/${id}`),
  saveReview: (payload) => request("/reviews", { method: "POST", body: JSON.stringify(payload) }),
  deleteReview: (restaurantId) => request(`/reviews/${restaurantId}`, { method: "DELETE" }),
  submitReport: (payload) => request("/reports", { method: "POST", body: JSON.stringify(payload) }),
  reports: () => request("/reports")
};
