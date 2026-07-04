import { useEffect, useState } from "react";
import { ClipboardCheck, ShieldAlert, Utensils } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../services/api.js";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    Promise.all([api.reports(), api.restaurants()]).then(([reportData, restaurantData]) => {
      setReports(reportData);
      setRestaurants(restaurantData);
    });
  }, []);

  const averageScore = restaurants.length
    ? Math.round(restaurants.reduce((sum, restaurant) => sum + restaurant.safetyScore, 0) / restaurants.length)
    : 0;

  return (
    <section className="page-shell">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-safety">Moderator view</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Admin dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <Utensils className="h-6 w-6 text-forest" aria-hidden="true" />
          <p className="mt-3 text-3xl font-black text-ink">{restaurants.length}</p>
          <p className="text-sm font-semibold text-gray-600">Restaurants tracked</p>
        </div>
        <div className="card p-5">
          <ShieldAlert className="h-6 w-6 text-warning" aria-hidden="true" />
          <p className="mt-3 text-3xl font-black text-ink">{reports.length}</p>
          <p className="text-sm font-semibold text-gray-600">Reports submitted</p>
        </div>
        <div className="card p-5">
          <ClipboardCheck className="h-6 w-6 text-safety" aria-hidden="true" />
          <p className="mt-3 text-3xl font-black text-ink">{averageScore}</p>
          <p className="text-sm font-semibold text-gray-600">Average safety score</p>
        </div>
      </div>

      <section className="mt-6 card p-5">
        <h2 className="text-xl font-black text-ink">Incident queue</h2>
        <div className="mt-4 space-y-3">
          {reports.length ? (
            reports.map((report) => (
              <article key={report.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-bold text-ink">{report.category}</h3>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-warning">{report.status}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{report.description}</p>
              </article>
            ))
          ) : (
            <EmptyState title="No reports yet" message="Submitted reports will appear here for moderator review." />
          )}
        </div>
      </section>
    </section>
  );
}
