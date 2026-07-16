import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    allergies: "",
    preferences: ""
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate(user.role === "restaurant_owner" ? "/owner" : "/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-shell max-w-2xl">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Diner accounts can save allergies and preferences. Restaurant owner accounts require Annapurna moderation approval.
        </p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="label">Name</span>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block space-y-2">
            <span className="label">Email</span>
            <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="block space-y-2">
            <span className="label">Password</span>
            <input className="field" type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label className="block space-y-2">
            <span className="label">Account type</span>
            <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Diner/User</option>
              <option value="restaurant_owner">Restaurant Owner</option>
            </select>
          </label>
          {form.role === "user" ? (
            <>
              <label className="block space-y-2">
                <span className="label">Dietary preferences</span>
                <input className="field" placeholder="Vegetarian, Jain, Vegan" value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} />
              </label>
              <label className="block space-y-2 sm:col-span-2">
                <span className="label">Allergies</span>
                <input className="field" placeholder="Dairy, Nuts, Gluten" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              </label>
            </>
          ) : (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-forest sm:col-span-2">
              Restaurant owner accounts start pending. Annapurna moderation must approve the account and assign a restaurant before management tools are available.
            </p>
          )}
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
          <button className="btn-primary sm:col-span-2" type="submit">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Register
          </button>
        </form>
      </div>
    </section>
  );
}
