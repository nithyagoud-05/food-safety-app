import { useEffect, useMemo, useState } from "react";
import { Save, Plus, EyeOff, Pencil } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../services/api.js";

const blankMenu = {
  dishName: "",
  category: "Menu",
  foodType: "veg",
  description: "",
  price: "",
  ingredients: "",
  allergens: "",
  dietaryMarkers: "",
  available: true
};

function listFromText(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [restaurantForm, setRestaurantForm] = useState({});
  const [menuForm, setMenuForm] = useState(blankMenu);
  const [editingMenuId, setEditingMenuId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await api.ownerSummary();
    setSummary(data);
    const firstId = data.restaurants?.[0]?.id || "";
    setSelectedId((current) => current || firstId);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const restaurant = useMemo(
    () => summary?.restaurants?.find((item) => item.id === selectedId),
    [summary, selectedId]
  );

  useEffect(() => {
    if (!restaurant) return;
    setRestaurantForm({
      description: restaurant.description || "",
      phone: restaurant.phone || "",
      website: restaurant.website || "",
      openingHours: restaurant.openingHours || "",
      cuisine: restaurant.cuisine || "",
      image: restaurant.image || "",
      ingredients: (restaurant.ingredients || []).join(", "),
      allergens: (restaurant.allergens || []).join(", ")
    });
    Promise.all([api.ownerReviews(restaurant.id), api.ownerReports(restaurant.id)])
      .then(([reviewData, reportData]) => {
        setReviews(reviewData);
        setReports(reportData);
      })
      .catch((err) => setError(err.message));
  }, [restaurant?.id]);

  async function saveRestaurant(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.updateOwnerRestaurant(restaurant.id, {
        ...restaurantForm,
        ingredients: listFromText(restaurantForm.ingredients),
        allergens: listFromText(restaurantForm.allergens)
      });
      await load();
      setMessage("Restaurant transparency updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addDish(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        ...menuForm,
        ingredients: listFromText(menuForm.ingredients),
        allergens: listFromText(menuForm.allergens),
        dietaryMarkers: listFromText(menuForm.dietaryMarkers)
      };
      if (editingMenuId) {
        await api.updateMenuItem(restaurant.id, editingMenuId, payload);
        setMessage("Menu item updated.");
      } else {
        await api.addMenuItem(restaurant.id, payload);
        setMessage("Menu item added.");
      }
      setMenuForm(blankMenu);
      setEditingMenuId("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deactivateDish(itemId) {
    if (!confirm("Deactivate this menu item?")) return;
    setError("");
    try {
      await api.deactivateMenuItem(restaurant.id, itemId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditDish(dish) {
    setEditingMenuId(dish._id || dish.id);
    setMenuForm({
      dishName: dish.dishName || "",
      category: dish.category || "Menu",
      foodType: dish.foodType || "veg",
      description: dish.description || "",
      price: dish.price ?? "",
      ingredients: (dish.ingredients || []).join(", "),
      allergens: (dish.allergens || []).join(", "),
      dietaryMarkers: (dish.dietaryMarkers || []).join(", "),
      available: dish.available !== false
    });
  }

  if (!summary && !error) return <section className="page-shell">Loading owner dashboard...</section>;

  if (summary?.approvalStatus !== "approved") {
    const rejected = summary?.approvalStatus === "rejected";
    return (
      <section className="page-shell max-w-3xl">
        <div className="card p-6">
          <h1 className="text-2xl font-black text-ink">
            {rejected ? "Restaurant owner request was not approved" : "Restaurant owner approval pending"}
          </h1>
          <p className="mt-3 text-gray-600">
            {rejected
              ? "This owner request is not currently approved for restaurant management. Contact Annapurna moderation if this needs review."
              : "Annapurna moderation must approve your account and assign a restaurant before management tools become available."}
          </p>
        </div>
      </section>
    );
  }

  if (!summary.restaurants?.length) {
    return (
      <section className="page-shell">
        <EmptyState title="Account approved. Restaurant assignment pending." message="An admin must assign your restaurant before management tools are enabled." />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-safety">Owner Workspace</p>
        <h1 className="mt-2 text-3xl font-black text-ink">My Restaurant</h1>
      </div>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm font-bold text-forest">{message}</p>}
      <select className="field mb-5 max-w-lg" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
        {summary.restaurants.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>

      {restaurant && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Transparency Details</h2>
            <p className="mt-2 text-sm text-gray-600">{restaurant.platformVerification}</p>
            <form className="mt-4 space-y-3" onSubmit={saveRestaurant}>
              {["description", "phone", "website", "openingHours", "cuisine", "image", "ingredients", "allergens"].map((field) => (
                <label className="block space-y-1" key={field}>
                  <span className="label">{field}</span>
                  <input className="field" value={restaurantForm[field] || ""} onChange={(e) => setRestaurantForm({ ...restaurantForm, [field]: e.target.value })} />
                </label>
              ))}
              <button className="btn-primary" type="submit"><Save className="h-4 w-4" /> Save</button>
            </form>
          </section>

          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">{editingMenuId ? "Edit Menu Item" : "Add Menu Item"}</h2>
            <p className="mt-2 text-sm text-gray-600">Declare major ingredients and allergens only. No recipes or proprietary ratios are required.</p>
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={addDish}>
              <input className="field" placeholder="Dish name" value={menuForm.dishName} onChange={(e) => setMenuForm({ ...menuForm, dishName: e.target.value })} required />
              <input className="field" placeholder="Category" value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
              <select className="field" value={menuForm.foodType} onChange={(e) => setMenuForm({ ...menuForm, foodType: e.target.value })}>
                <option value="veg">Veg</option>
                <option value="non_veg">Non-Veg</option>
                <option value="egg">Egg</option>
              </select>
              <input className="field" placeholder="Price" type="number" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} />
              <textarea className="field sm:col-span-2" placeholder="Description" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} />
              <input className="field sm:col-span-2" placeholder="Major ingredients, comma separated" value={menuForm.ingredients} onChange={(e) => setMenuForm({ ...menuForm, ingredients: e.target.value })} />
              <input className="field sm:col-span-2" placeholder="Declared allergens, comma separated" value={menuForm.allergens} onChange={(e) => setMenuForm({ ...menuForm, allergens: e.target.value })} />
              <input className="field sm:col-span-2" placeholder="Dietary markers, comma separated" value={menuForm.dietaryMarkers} onChange={(e) => setMenuForm({ ...menuForm, dietaryMarkers: e.target.value })} />
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 sm:col-span-2">
                <input type="checkbox" checked={menuForm.available} onChange={(e) => setMenuForm({ ...menuForm, available: e.target.checked })} />
                Available
              </label>
              <button className="btn-primary sm:col-span-2" type="submit"><Plus className="h-4 w-4" /> {editingMenuId ? "Save item" : "Add item"}</button>
            </form>
          </section>

          <section className="card p-5 xl:col-span-2">
            <h2 className="text-xl font-black text-ink">Menu Management</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(restaurant.menuItems || []).map((dish) => (
                <div key={dish._id || dish.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{dish.dishName}</p>
                      <p className="text-sm text-gray-600">{dish.category} · {dish.foodType}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary px-3" onClick={() => startEditDish(dish)}><Pencil className="h-4 w-4" /></button>
                      <button className="btn-secondary px-3" onClick={() => deactivateDish(dish._id || dish.id)}><EyeOff className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{dish.available === false ? "Inactive" : "Available"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Authenticated User Reviews</h2>
            <div className="mt-3 space-y-2">{reviews.map((review) => <p key={review.id} className="rounded-md bg-gray-50 p-3 text-sm">{review.rating}/5 - {review.comment}</p>)}</div>
          </section>
          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Food-Safety Concerns</h2>
            <div className="mt-3 space-y-2">{reports.map((report) => <p key={report.id} className="rounded-md bg-gray-50 p-3 text-sm">{report.category} - {report.status}</p>)}</div>
          </section>
        </div>
      )}
    </section>
  );
}
