import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ClipboardList, Star, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../services/api.js";

function intersects(items = [], allergies = []) {
  const allergySet = new Set(allergies.map((item) => item.toLowerCase()));
  return items.filter((item) => allergySet.has(item.toLowerCase()));
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState("");
  const [foodFilter, setFoodFilter] = useState("all");

  async function loadRestaurant() {
    setLoading(true);
    try {
      setRestaurant(await api.restaurant(id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const myReview = useMemo(
    () => restaurant?.reviews?.find((item) => item.userId === user?.id),
    [restaurant, user]
  );

  const groupedDishes = useMemo(() => {
    const dishes = restaurant?.dishes || [];
    const filtered = dishes.filter((dish) => {
      if (foodFilter === "all") return true;
      if (foodFilter === "veg") return dish.foodType === "veg";
      if (foodFilter === "non_veg") return dish.foodType === "non_veg";
      if (foodFilter === "egg") return dish.foodType === "egg";
      return true;
    });
    return filtered.reduce((groups, dish) => {
      const category = dish.category || "Menu";
      groups[category] = groups[category] || [];
      groups[category].push(dish);
      return groups;
    }, {});
  }, [restaurant, foodFilter]);

  useEffect(() => {
    if (myReview) setReview({ rating: myReview.rating, comment: myReview.comment });
  }, [myReview]);

  async function submitReview(event) {
    event.preventDefault();
    setMessage("");
    await api.saveReview({ restaurantId: id, ...review });
    setReview({ rating: 5, comment: "" });
    setMessage("Review saved.");
    await loadRestaurant();
  }

  async function removeReview() {
    await api.deleteReview(id);
    setMessage("Review deleted.");
    await loadRestaurant();
  }

  if (loading) return <section className="page-shell">Loading restaurant...</section>;
  if (!restaurant) return <EmptyState title="Restaurant not found" message="The profile could not be loaded." />;

  return (
    <section className="page-shell">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
        <img className="h-72 w-full object-cover" src={restaurant.image} alt={restaurant.name} />
        <div className="flex flex-col justify-between gap-5 p-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-safety">{restaurant.cuisine}</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{restaurant.name}</h1>
            <p className="mt-2 text-gray-600">{restaurant.location}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              {restaurant.rating} overall
            </span>
            <ScoreBadge score={restaurant.safetyScore} badge={restaurant.badge} />
            <Link to={`/report?restaurantId=${restaurant.id}`} className="btn-primary">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Report issue
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Annapurna Safety Intelligence</h2>
            {restaurant.safetyDataStatus === "calculated" && restaurant.safetyScore !== null ? (
              <div className="mt-4 space-y-3">
                <ScoreBadge score={restaurant.safetyScore} badge={restaurant.badge} />
                <p className="text-sm text-gray-600">{restaurant.safetyBreakdown?.explanation}</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {["baseScore", "reviewSignal", "incidentPenalty", "unresolvedPenalty"].map((key) => (
                    <div key={key} className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs font-bold uppercase text-gray-500">{key}</p>
                      <p className="text-lg font-black text-ink">{restaurant.safetyBreakdown?.[key] ?? 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                Insufficient Annapurna safety data. This is not a government or FSSAI score.
              </p>
            )}
            <p className="mt-3 text-sm text-gray-600">{restaurant.platformVerification}</p>
          </section>

          <section className="card p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-ink">Menu Transparency</h2>
                <p className="mt-1 text-sm text-gray-600">Declared major ingredients support dietary and allergen transparency, not recipe disclosure.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "All"],
                  ["veg", "Veg"],
                  ["non_veg", "Non-Veg"],
                  ["egg", "Egg"]
                ].map(([value, label]) => (
                  <button key={value} className={foodFilter === value ? "btn-primary px-3" : "btn-secondary px-3"} onClick={() => setFoodFilter(value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-6">
              {Object.entries(groupedDishes).map(([category, dishes]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-safety">{category}</h3>
                  <div className="space-y-4">
                    {dishes.map((dish) => {
                      const ingredientHits = intersects(dish.ingredients, user?.allergies || []);
                      const allergenHits = intersects(dish.allergens, user?.allergies || []);
                      const warnings = [...new Set([...ingredientHits, ...allergenHits])];
                      const hasTransparency = dish.ingredients?.length || dish.allergens?.length;
                      return (
                        <article key={dish.id} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`h-3 w-3 rounded-full ${dish.foodType === "non_veg" ? "bg-red-600" : dish.foodType === "egg" ? "bg-amber-500" : "bg-green-600"}`} />
                                <h4 className="text-lg font-bold text-ink">{dish.dishName}</h4>
                                {dish.available === false && <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">Unavailable</span>}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{dish.description}</p>
                              {dish.price !== null && dish.price !== undefined && <p className="mt-1 text-sm font-bold text-ink">Rs. {dish.price}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(dish.allergens || []).map((allergen) => (
                                <span key={allergen} className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-warning">
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                          {warnings.length > 0 && (
                            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                              Warning: this dish matches your allergy profile: {warnings.join(", ")}. Based on ingredient and allergen information currently available in Annapurna.
                            </p>
                          )}
                          {hasTransparency ? (
                            <div className="mt-3 space-y-1 text-sm text-gray-700">
                              <p><span className="font-bold">Major declared ingredients:</span> {(dish.ingredients || []).join(", ") || "Not declared"}</p>
                              <p><span className="font-bold">Declared allergens:</span> {(dish.allergens || []).join(", ") || "None declared"}</p>
                              <p><span className="font-bold">Dietary markers:</span> {(dish.dietaryMarkers || []).join(", ") || dish.foodType}</p>
                            </div>
                          ) : (
                            <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                              Ingredient transparency data is not currently available.
                            </p>
                          )}
                          {dish.dataDisclaimer && <p className="mt-3 text-xs text-gray-500">{dish.dataDisclaimer}</p>}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Authenticated User Reviews</h2>
            <div className="mt-4 space-y-3">
              {restaurant.reviews.length ? (
                restaurant.reviews.map((item) => (
                  <article key={item.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-ink">{item.userName || "Authenticated user"}</p>
                      <p className="text-sm font-bold text-amber-600">{item.rating}/5</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{item.comment}</p>
                  </article>
                ))
              ) : (
                <EmptyState title="No reviews yet" message="Be the first authenticated user to review this restaurant. Annapurna does not yet verify visits or purchases." />
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink">
              <ClipboardList className="h-5 w-5 text-forest" aria-hidden="true" />
              Public Safety History
            </h2>
            <div className="mt-4 space-y-3">
              {restaurant.safetyHistory.length ? (
                restaurant.safetyHistory.map((report) => (
                  <div key={report.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <p className="font-bold text-ink">Consumer-reported safety concern: {report.category}</p>
                    <p className="mt-1 text-gray-600">{report.severity} · {report.status}</p>
                    <p className="mt-1 text-xs text-gray-500">{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No public Annapurna safety concerns are currently listed.</p>
              )}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">{myReview ? "Edit your review" : "Submit review"}</h2>
            {isAuthenticated ? (
              <form className="mt-4 space-y-4" onSubmit={submitReview}>
                <label className="block space-y-2">
                  <span className="label">Rating</span>
                  <select className="field" value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="label">Comment</span>
                  <textarea className="field min-h-28" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} required />
                </label>
                {message && <p className="text-sm font-bold text-forest">{message}</p>}
                <button className="btn-primary w-full" type="submit">Save review</button>
                {myReview && (
                  <button className="btn-secondary w-full" type="button" onClick={removeReview}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete review
                  </button>
                )}
              </form>
            ) : (
              <Link to="/login" className="btn-primary mt-4 w-full">Login to review</Link>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
