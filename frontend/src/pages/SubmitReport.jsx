import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ImagePlus, Send, X } from "lucide-react";
import { api } from "../services/api.js";

const categories = ["Unhygienic Food", "Allergy Issue", "Food Poisoning", "Wrong Ingredients", "Other"];
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;
const maxImages = 3;

export default function SubmitReport() {
  const [params] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [evidenceImageUrls, setEvidenceImageUrls] = useState([]);
  const [form, setForm] = useState({
    restaurantId: params.get("restaurantId") || "",
    category: "Unhygienic Food",
    description: ""
  });

  useEffect(() => {
    api.restaurants().then(setRestaurants);
  }, []);

  async function handleEvidenceUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setMessage("");
    setError("");

    if (!files.length) return;
    if (files.length > maxImages) {
      setError("Upload a maximum of 3 images.");
      return;
    }
    const invalidType = files.find((file) => !allowedImageTypes.has(file.type));
    if (invalidType) {
      setError("Unsupported file type. Upload JPG, JPEG, PNG, or WEBP images.");
      return;
    }
    const oversized = files.find((file) => file.size > maxImageSize);
    if (oversized) {
      setError("Each evidence image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadReportEvidence(files);
      setEvidenceImageUrls(result.evidenceImageUrls || result.urls || []);
    } catch (err) {
      setEvidenceImageUrls([]);
      setError(err.message || "Evidence upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.submitReport({ ...form, evidenceImageUrls });
      setForm({ ...form, category: "Unhygienic Food", description: "" });
      setEvidenceImageUrls([]);
      setMessage("Report submitted with Pending status.");
    } catch (err) {
      setError(err.message);
    }
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
          <div className="space-y-2">
            <span className="label">Evidence images</span>
            <div className="flex flex-wrap items-center gap-3">
              <label className={`btn-secondary cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {uploading ? "Uploading..." : "Upload Evidence"}
                <input className="sr-only" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple onChange={handleEvidenceUpload} disabled={uploading} />
              </label>
              {evidenceImageUrls.length > 0 && (
                <button className="btn-secondary" type="button" onClick={() => setEvidenceImageUrls([])} disabled={uploading}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              )}
              <span className="text-xs font-semibold text-gray-500">Optional · JPG, PNG, WEBP · 5 MB each · max 3</span>
            </div>
            {uploading && <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-bold text-forest">Uploading evidence images...</p>}
            {evidenceImageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {evidenceImageUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block h-20 w-20 overflow-hidden rounded-md border border-gray-200">
                    <img src={url} alt="Uploaded evidence" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
          {message && <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-bold text-forest">{message}</p>}
          <button className="btn-primary" type="submit" disabled={uploading}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {uploading ? "Uploading evidence..." : "Submit report"}
          </button>
        </form>
      </div>
    </section>
  );
}
