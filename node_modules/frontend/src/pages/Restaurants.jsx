import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import RestaurantCard from "../components/RestaurantCard.jsx";
import { api } from "../services/api.js";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setRestaurants(await api.restaurants(search));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <section className="page-shell">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-safety">Restaurant discovery</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Find safer places to eat</h1>
        </div>
        <label className="relative block w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            className="field pl-10"
            placeholder="Search by name, cuisine, or area"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center font-semibold text-gray-600">Loading restaurants...</div>
      ) : restaurants.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <EmptyState title="No restaurants found" message="Try a different restaurant name, cuisine, or area." />
      )}
    </section>
  );
}
