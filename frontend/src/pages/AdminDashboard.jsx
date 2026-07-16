import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, UserCheck, Ban, Store, ClipboardList, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";

const tabs = ["Overview", "Users", "Pending Owners", "Restaurants", "Food Safety Reports", "Review Moderation"];

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [overview, setOverview] = useState({});
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [restaurantForm, setRestaurantForm] = useState({ name: "", address: "", city: "Hyderabad", cuisine: "", description: "", image: "" });
  const [editingRestaurantId, setEditingRestaurantId] = useState("");
  const [assignment, setAssignment] = useState({ restaurantId: "", ownerId: "" });
  const [reportEdits, setReportEdits] = useState({});

  const owners = useMemo(() => users.filter((user) => user.role === "restaurant_owner"), [users]);
  const eligibleOwners = owners.filter((user) => user.status !== "blocked" && user.ownerApprovalStatus === "approved");
  const pendingOwners = owners.filter((user) => user.ownerApprovalStatus === "pending");

  async function load() {
    const [overviewData, usersData, restaurantsData, reportsData, reviewsData] = await Promise.all([
      api.adminOverview(),
      api.adminUsers(),
      api.adminRestaurants(),
      api.reports(),
      api.adminReviews()
    ]);
    setOverview(overviewData);
    setUsers(usersData);
    setRestaurants(restaurantsData);
    setReports(reportsData);
    setReviews(reviewsData);
    setAssignment({
      restaurantId: restaurantsData[0]?.id || "",
      ownerId: eligibleOwners[0]?.id || ""
    });
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function run(action, success) {
    setError("");
    setMessage("");
    try {
      await action();
      await load();
      setMessage(success);
    } catch (err) {
      setError(err.message);
    }
  }

  function confirmRun(prompt, action, success) {
    if (confirm(prompt)) run(action, success);
  }

  async function createRestaurant(event) {
    event.preventDefault();
    await run(() => api.createRestaurant({ ...restaurantForm, dataProfile: "public_metadata" }), "Restaurant created.");
    setRestaurantForm({ name: "", address: "", city: "Hyderabad", cuisine: "", description: "", image: "" });
  }

  async function saveRestaurantEdit(event) {
    event.preventDefault();
    await run(() => api.updateRestaurant(editingRestaurantId, restaurantForm), "Restaurant updated.");
    setEditingRestaurantId("");
    setRestaurantForm({ name: "", address: "", city: "Hyderabad", cuisine: "", description: "", image: "" });
  }

  function startRestaurantEdit(restaurant) {
    setEditingRestaurantId(restaurant.id);
    setRestaurantForm({
      name: restaurant.name || "",
      address: restaurant.address || "",
      city: restaurant.city || "",
      cuisine: restaurant.cuisine || "",
      description: restaurant.description || "",
      image: restaurant.image || "",
      phone: restaurant.phone || "",
      website: restaurant.website || "",
      openingHours: restaurant.openingHours || "",
      dataDisclaimer: restaurant.dataDisclaimer || "",
      metadataSourceName: restaurant.metadataSourceName || "",
      metadataSourceUrl: restaurant.metadataSourceUrl || ""
    });
  }

  async function assignOwner(event) {
    event.preventDefault();
    await run(() => api.assignOwner(assignment.restaurantId, assignment.ownerId), "Restaurant assigned.");
  }

  async function moderateReport(reportId) {
    const edit = reportEdits[reportId] || {};
    await run(() => api.updateReportStatus(reportId, edit), "Report status updated.");
  }

  return (
    <section className="page-shell">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-safety">Food Safety Moderation</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Regulatory Overview</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Annapurna's moderation architecture is designed to support future integration with authorised food-safety data sources and regulatory workflows.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {message && <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm font-bold text-forest">{message}</p>}
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

      {activeTab === "Overview" && (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {[
            ["Active restaurants", overview.activeRestaurants, Store],
            ["Insufficient safety data", overview.insufficientSafetyData, ClipboardList],
            ["Pending concerns", overview.pendingReports, ClipboardList],
            ["Under review", overview.underReviewReports, ClipboardList],
            ["Resolved concerns", overview.resolvedReports, ShieldCheck],
            ["High-severity unresolved", overview.highSeverityUnresolved, ClipboardList],
            ["Pending owners", overview.pendingOwners, UserCheck],
            ["Blocked users", overview.blockedUsers, Ban]
          ].map(([label, value, Icon]) => (
            <div key={label} className="card p-5">
              <Icon className="h-5 w-5 text-forest" />
              <p className="mt-3 text-3xl font-black text-ink">{value ?? 0}</p>
              <p className="text-sm font-semibold text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Users" && (
        <section className="card p-5">
          <h2 className="text-xl font-black text-ink">Users</h2>
          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-ink">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email} · {user.role} · {user.status}</p>
                </div>
                <div className="flex gap-2">
                  {user.role === "admin" || user.id === currentUser?.id ? (
                    <span className="rounded-md bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600">Protected admin</span>
                  ) : user.status === "blocked" ? (
                    <button className="btn-secondary" onClick={() => run(() => api.unblockUser(user.id), "User unblocked.")}>Unblock</button>
                  ) : (
                    <button className="btn-secondary" onClick={() => confirmRun("Block this user?", () => api.blockUser(user.id), "User blocked.")}>Block</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "Pending Owners" && (
        <section className="card p-5">
          <h2 className="text-xl font-black text-ink">Pending Restaurant Owners</h2>
          <div className="mt-4 space-y-3">
            {pendingOwners.length ? pendingOwners.map((owner) => (
              <div key={owner.id} className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-ink">{owner.name}</p>
                  <p className="text-sm text-gray-600">{owner.email}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => run(() => api.approveOwner(owner.id), "Owner approved.")}>Approve</button>
                  <button className="btn-secondary" onClick={() => confirmRun("Reject this owner?", () => api.rejectOwner(owner.id), "Owner rejected.")}>Reject</button>
                </div>
              </div>
            )) : <EmptyState title="No pending owners" message="Owner registrations needing review will appear here." />}
          </div>
        </section>
      )}

      {activeTab === "Restaurants" && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">{editingRestaurantId ? "Edit Restaurant" : "Create Restaurant"}</h2>
            <form className="mt-4 space-y-3" onSubmit={editingRestaurantId ? saveRestaurantEdit : createRestaurant}>
              {["name", "address", "city", "cuisine", "image", "phone", "website", "openingHours", "dataDisclaimer", "metadataSourceName", "metadataSourceUrl"].map((field) => (
                <input key={field} className="field" placeholder={field} value={restaurantForm[field] || ""} onChange={(e) => setRestaurantForm({ ...restaurantForm, [field]: e.target.value })} required={["name", "address", "city", "cuisine"].includes(field)} />
              ))}
              <textarea className="field" placeholder="description" value={restaurantForm.description} onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })} required />
              <button className="btn-primary" type="submit">{editingRestaurantId ? "Save Restaurant" : "Create"}</button>
            </form>
            <form className="mt-6 space-y-3" onSubmit={assignOwner}>
              <h3 className="font-bold text-ink">Assign Owner</h3>
              <select className="field" value={assignment.restaurantId} onChange={(e) => setAssignment({ ...assignment, restaurantId: e.target.value })}>
                {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
              </select>
              <select className="field" value={assignment.ownerId} onChange={(e) => setAssignment({ ...assignment, ownerId: e.target.value })}>
                <option value="">Select approved owner</option>
                {eligibleOwners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
              </select>
              <button className="btn-primary" type="submit">Assign</button>
            </form>
          </section>
          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Restaurants</h2>
            <div className="mt-4 space-y-3">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-bold text-ink">{restaurant.name}</p>
                      <p className="text-sm text-gray-600">{restaurant.city} · {restaurant.platformVerification} · {restaurant.isActive === false ? "Inactive" : "Active"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary" onClick={() => startRestaurantEdit(restaurant)}>Edit</button>
                      <button className="btn-secondary" onClick={() => run(() => restaurant.verified ? api.unverifyRestaurant(restaurant.id) : api.verifyRestaurant(restaurant.id), "Verification updated.")}>{restaurant.verified ? "Unverify" : "Verify"}</button>
                      <button className="btn-secondary" onClick={() => confirmRun("Deactivate this restaurant?", () => api.deactivateRestaurant(restaurant.id), "Restaurant deactivated.")}>Deactivate</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "Food Safety Reports" && (
        <section className="card p-5">
          <h2 className="text-xl font-black text-ink">Incident Review Queue</h2>
          <div className="mt-4 space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-lg border border-gray-200 p-4">
                <p className="font-bold text-ink">{report.restaurantName || report.restaurantId} - {report.category} - {report.severity}</p>
                <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                {report.evidenceImageUrl && <p className="mt-1 text-xs font-semibold text-gray-500">Evidence: {report.evidenceImageUrl}</p>}
                <div className="mt-3 grid gap-2 sm:grid-cols-[160px_160px_1fr_auto]">
                  <select className="field" value={reportEdits[report.id]?.status || report.status} onChange={(e) => setReportEdits({ ...reportEdits, [report.id]: { ...(reportEdits[report.id] || {}), status: e.target.value } })}>
                    {["Pending", "Under Review", "Resolved", "Rejected"].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <select className="field" value={reportEdits[report.id]?.severity || report.severity} onChange={(e) => setReportEdits({ ...reportEdits, [report.id]: { ...(reportEdits[report.id] || {}), severity: e.target.value } })}>
                    {["Low", "Medium", "High", "Critical"].map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                  </select>
                  <input className="field" placeholder="Resolution note" value={reportEdits[report.id]?.resolutionNote || ""} onChange={(e) => setReportEdits({ ...reportEdits, [report.id]: { ...(reportEdits[report.id] || {}), resolutionNote: e.target.value } })} />
                  <button className="btn-primary" onClick={() => moderateReport(report.id)}>Update</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "Review Moderation" && (
        <section className="card p-5">
          <h2 className="text-xl font-black text-ink">Review Moderation</h2>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-ink">{review.restaurantName || review.restaurantId} - {review.userName || "User"} - {review.rating}/5</p>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
                <button className="btn-secondary" onClick={() => confirmRun("Delete this review for moderation?", () => api.deleteReviewAdmin(review.id), "Review deleted.")}><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
