import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import ScoreBadge from "./ScoreBadge.jsx";

export default function RestaurantCard({ restaurant }) {
  return (
    <article className="card overflow-hidden">
      <img className="h-48 w-full object-cover" src={restaurant.image} alt={restaurant.name} />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">{restaurant.name}</h3>
            <p className="text-sm font-medium text-safety">{restaurant.cuisine}</p>
          </div>
          <ScoreBadge score={restaurant.safetyScore} badge={restaurant.badge} />
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
            {restaurant.location}
          </p>
          <p className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            {restaurant.rating} rating from {restaurant.reviewCount} reviews
          </p>
        </div>
        <Link to={`/restaurants/${restaurant.id}`} className="btn-primary w-full">
          View transparency profile
        </Link>
      </div>
    </article>
  );
}
