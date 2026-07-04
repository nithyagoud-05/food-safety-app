import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page-shell text-center">
      <h1 className="text-5xl font-black text-ink">404</h1>
      <p className="mt-3 text-gray-600">This page is not available.</p>
      <Link to="/restaurants" className="btn-primary mt-6">
        Browse restaurants
      </Link>
    </section>
  );
}
