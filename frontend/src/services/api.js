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
  reports: () => request("/reports"),
  adminOverview: () => request("/admin/overview"),
  adminUsers: () => request("/admin/users"),
  adminRestaurants: () => request("/admin/restaurants"),
  adminReviews: () => request("/admin/reviews"),
  approveOwner: (userId) => request(`/admin/users/${userId}/approve-owner`, { method: "PATCH" }),
  rejectOwner: (userId) => request(`/admin/users/${userId}/reject-owner`, { method: "PATCH" }),
  blockUser: (userId) => request(`/admin/users/${userId}/block`, { method: "PATCH" }),
  unblockUser: (userId) => request(`/admin/users/${userId}/unblock`, { method: "PATCH" }),
  createRestaurant: (payload) => request("/admin/restaurants", { method: "POST", body: JSON.stringify(payload) }),
  updateRestaurant: (id, payload) => request(`/admin/restaurants/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deactivateRestaurant: (id) => request(`/admin/restaurants/${id}/deactivate`, { method: "PATCH" }),
  verifyRestaurant: (id) => request(`/admin/restaurants/${id}/verify`, { method: "PATCH" }),
  unverifyRestaurant: (id) => request(`/admin/restaurants/${id}/unverify`, { method: "PATCH" }),
  assignOwner: (restaurantId, ownerId) =>
    request(`/admin/restaurants/${restaurantId}/assign-owner`, { method: "PATCH", body: JSON.stringify({ ownerId }) }),
  updateReportStatus: (reportId, payload) =>
    request(`/admin/reports/${reportId}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteReviewAdmin: (reviewId) => request(`/admin/reviews/${reviewId}`, { method: "DELETE" }),
  ownerSummary: () => request("/owner/summary"),
  ownerRestaurants: () => request("/owner/restaurants"),
  ownerRestaurant: (id) => request(`/owner/restaurants/${id}`),
  updateOwnerRestaurant: (id, payload) => request(`/owner/restaurants/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  ownerReviews: (id) => request(`/owner/restaurants/${id}/reviews`),
  ownerReports: (id) => request(`/owner/restaurants/${id}/reports`),
  addMenuItem: (id, payload) => request(`/owner/restaurants/${id}/menu`, { method: "POST", body: JSON.stringify(payload) }),
  updateMenuItem: (id, itemId, payload) =>
    request(`/owner/restaurants/${id}/menu/${itemId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deactivateMenuItem: (id, itemId) => request(`/owner/restaurants/${id}/menu/${itemId}/deactivate`, { method: "PATCH" })
};
