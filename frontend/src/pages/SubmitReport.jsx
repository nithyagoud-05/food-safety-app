import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { api } from "../services/api.js";

const categories = ["Unhygienic Food", "Allergy Issue", "Food Poisoning", "Wrong Ingredients", "Other"];

export default function SubmitReport() {
  const [params] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    restaurantId: params.get("restaurantId") || "",
    category: "Unhygienic Food",
    description: "",
    image: ""
  });

  useEffect(() => {
    api.restaurants().then(setRestaurants);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    await api.submitReport(form);
    setForm({ ...form, category: "Unhygienic Food", description: "", image: "" });
    setMessage("Report submitted with Pending status.");
  }

  return (
    <section className="page-shell max-w-3xl">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-ink">Submit food safety report</h1>
        <p className="mt-2 text-sm text-gray-600">Reports help keep safety history visible and actionable.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="label">Restaurant</span>
            <select className="field" value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })} required>
              <option value="">Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="label">Category</span>
            <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="label">Description</span>
            <textarea className="field min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </label>
          <label className="block space-y-2">
            <span className="label">Optional image URL</span>
            <input className="field" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          {message && <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-bold text-forest">{message}</p>}
          <button className="btn-primary" type="submit">
            <Send className="h-4 w-4" aria-hidden="true" />
            Submit report
          </button>
        </form>
      </div>
    </section>
  );
}
