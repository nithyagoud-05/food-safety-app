import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const user = await login(form);
      navigate(location.state?.from || (user.role === "admin" ? "/admin" : user.role === "restaurant_owner" ? "/owner" : "/dashboard"));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-shell max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-ink">Login</h1>
        <p className="mt-2 text-sm text-gray-600">Access reviews, reports, and your allergy profile.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="label">Email</span>
            <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="block space-y-2">
            <span className="label">Password</span>
            <input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          <button className="btn-primary w-full" type="submit">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          New to Annapurna? <Link className="font-bold text-forest" to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
