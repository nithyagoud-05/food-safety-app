import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../services/api.js";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ allergies: "", preferences: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({
      allergies: (user?.allergies || []).join(", "),
      preferences: (user?.preferences || []).join(", ")
    });
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();
    await api.updateProfile(form);
    await refreshUser();
    setMessage("Profile updated.");
  }

  return (
    <section className="page-shell max-w-2xl">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-ink">Profile</h1>
        <p className="mt-2 text-sm text-gray-600">{user?.email}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="label">Allergies</span>
            <input className="field" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
          </label>
          <label className="block space-y-2">
            <span className="label">Dietary preferences</span>
            <input className="field" value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} />
          </label>
          {message && <p className="text-sm font-bold text-forest">{message}</p>}
          <button className="btn-primary" type="submit">
            <Save className="h-4 w-4" aria-hidden="true" />
            Save profile
          </button>
        </form>
      </div>
    </section>
  );
}
