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
            <h2 className="text-xl font-black text-ink">Menu and ingredients</h2>
            <div className="mt-4 space-y-4">
              {restaurant.dishes.map((dish) => {
                const ingredientHits = intersects(dish.ingredients, user?.allergies || []);
                const allergenHits = intersects(dish.allergens, user?.allergies || []);
                const warnings = [...new Set([...ingredientHits, ...allergenHits])];
                return (
                  <article key={dish.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <h3 className="text-lg font-bold text-ink">{dish.dishName}</h3>
                        <p className="mt-1 text-sm text-gray-600">{dish.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dish.allergens.map((allergen) => (
                          <span key={allergen} className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-warning">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                    {warnings.length > 0 && (
                      <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                        Warning: matches your allergy profile: {warnings.join(", ")}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-gray-700">
                      <span className="font-bold">Ingredients:</span> {dish.ingredients.join(", ")}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-xl font-black text-ink">Verified reviews</h2>
            <div className="mt-4 space-y-3">
              {restaurant.reviews.length ? (
                restaurant.reviews.map((item) => (
                  <article key={item.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-ink">{item.userName || "Verified user"}</p>
                      <p className="text-sm font-bold text-amber-600">{item.rating}/5</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{item.comment}</p>
                  </article>
                ))
              ) : (
                <EmptyState title="No reviews yet" message="Be the first authenticated user to review this restaurant." />
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink">
              <ClipboardList className="h-5 w-5 text-forest" aria-hidden="true" />
              Safety history
            </h2>
            <div className="mt-4 space-y-3">
              {restaurant.safetyHistory.length ? (
                restaurant.safetyHistory.map((report) => (
                  <div key={report.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <p className="font-bold text-ink">{report.category}</p>
                    <p className="mt-1 text-gray-600">{report.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No unresolved safety incidents in the current demo data.</p>
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
