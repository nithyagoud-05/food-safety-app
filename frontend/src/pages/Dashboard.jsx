import { Link } from "react-router-dom";
import { AlertTriangle, Search, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

const actions = [
  { title: "Search restaurants", text: "Browse cards by name, cuisine, or area.", to: "/restaurants", icon: Search },
  { title: "Check safety scores", text: "Compare transparent score badges before visiting.", to: "/restaurants", icon: ShieldCheck },
  { title: "Submit a report", text: "Flag hygiene, allergy, poisoning, or ingredient issues.", to: "/report", icon: AlertTriangle },
  { title: "Manage profile", text: "Keep allergy and preference signals updated.", to: "/profile", icon: Star }
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-safety">Consumer safety workspace</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Welcome{user ? `, ${user.name}` : ""}</h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          Annapurna brings restaurant discovery, ingredient awareness, authenticated user reviews, and reporting into one
          practical flow.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.to} className="card block p-5 transition hover:-translate-y-1 hover:border-green-300">
              <Icon className="h-6 w-6 text-forest" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-ink">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{action.text}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
