import { Link } from "react-router-dom";
import { AlertTriangle, Search, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-ink text-white">
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80"
        alt="Fresh restaurant meal with visible ingredients"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/55 to-green-950/30" />
      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-green-100 ring-1 ring-white/20">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Food Safety Intelligence Platform
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">Annapurna</h1>
          <p className="mt-5 max-w-2xl text-xl font-medium text-green-50">
            Eat with confidence, not assumptions.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-100">
            Search restaurants, inspect ingredients, catch allergen risks, read verified reviews, and report food
            safety concerns from one trustworthy place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/restaurants" className="btn-primary bg-white text-forest hover:bg-green-50">
              <Search className="h-4 w-4" aria-hidden="true" />
              Explore restaurants
            </Link>
            <Link to="/report" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Report an issue
            </Link>
          </div>
        </div>
        <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
          {["Ingredient transparency", "Allergy awareness", "Safety score tracking"].map((item) => (
            <div key={item} className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
