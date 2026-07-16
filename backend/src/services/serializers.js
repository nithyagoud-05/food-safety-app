import { USER_ROLES, USER_STATUSES } from "../constants/auth.js";

function asId(value) {
  return value?._id?.toString?.() || value?.id?.toString?.() || value?.toString?.();
}

export function safetyBadge(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Moderate";
  return "Warning";
}

export function serializeUser(user) {
  if (!user) return null;
  const { password, __v, _id, ...rest } = user;
  return {
    ...rest,
    id: asId(_id || user.id),
    role: rest.role || USER_ROLES.USER,
    status: rest.status || USER_STATUSES.ACTIVE,
    ownerApprovalStatus:
      rest.ownerApprovalStatus || (rest.role === USER_ROLES.RESTAURANT_OWNER ? "pending" : undefined),
    savedRestaurants: (rest.savedRestaurants || []).map(asId)
  };
}

export function serializeRestaurant(restaurant) {
  const id = asId(restaurant._id || restaurant.id);
  const rating = Number(restaurant.averageRating || 0);
  const score = restaurant.safetyScore === undefined || restaurant.safetyScore === null ? null : Number(restaurant.safetyScore);

  return {
    ...restaurant,
    id,
    _id: undefined,
    __v: undefined,
    location: restaurant.address && restaurant.city ? `${restaurant.address}, ${restaurant.city}` : restaurant.address || "",
    area: restaurant.city || "",
    rating: Number(rating.toFixed(1)),
    reviewCount: Number(restaurant.totalReviews || 0),
    safetyScore: score,
    badge: score === null ? "Insufficient Data" : safetyBadge(score),
    platformVerification: restaurant.verified ? "Annapurna Verified" : "Not platform verified"
  };
}

export function serializeDish(dish) {
  return {
    id: asId(dish._id || dish.id),
    restaurantId: asId(dish.restaurantId),
    dishName: dish.dishName,
    description: dish.description || "",
    category: dish.category || "Menu",
    foodType: dish.foodType || "veg",
    price: dish.price ?? null,
    ingredients: dish.ingredients || [],
    allergens: dish.allergens || [],
    dietaryMarkers: dish.dietaryMarkers || [],
    available: dish.available !== false,
    sourceType: dish.sourceType || "demo",
    dataDisclaimer: dish.dataDisclaimer || ""
  };
}

export function serializeReview(review) {
  const user = review.user;
  const restaurant = review.restaurant;

  return {
    id: asId(review._id || review.id),
    userId: asId(user?._id || user || review.userId),
    userName: user?.name || review.userName || "Authenticated user",
    restaurantId: asId(restaurant?._id || restaurant || review.restaurantId),
    restaurantName: restaurant?.name,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    visitDate: review.visitDate,
    verified: review.verified,
    createdAt: review.createdAt
  };
}

export function serializeReport(report, options = {}) {
  const restaurant = report.restaurant;
  const user = report.user;
  const includeUser = options.includeUser ?? true;

  const value = {
    id: asId(report._id || report.id),
    restaurantId: asId(restaurant?._id || restaurant || report.restaurantId),
    restaurantName: restaurant?.name,
    category: report.type || report.category,
    type: report.type || report.category,
    severity: report.severity,
    description: report.description,
    status: report.status,
    sourceType: report.sourceType,
    resolutionNote: options.includeInternalNotes ? report.resolutionNote : undefined,
    reviewedAt: report.reviewedAt,
    createdAt: report.createdAt
  };

  if (includeUser) {
    value.userId = asId(user?._id || user || report.userId);
    value.userName = user?.name;
    value.description = report.description;
    value.evidenceImageUrl = report.evidenceImageUrl;
  }

  if (options.includeDescription && !includeUser) {
    value.description = report.description;
  }

  return value;
}

export function serializePublicReport(report) {
  return {
    id: asId(report._id || report.id),
    category: report.type || report.category,
    type: report.type || report.category,
    severity: report.severity,
    status: report.status,
    sourceType: report.sourceType,
    createdAt: report.createdAt
  };
}
