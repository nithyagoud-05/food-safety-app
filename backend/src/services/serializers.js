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
    savedRestaurants: (rest.savedRestaurants || []).map(asId)
  };
}

export function serializeRestaurant(restaurant) {
  const id = asId(restaurant._id || restaurant.id);
  const rating = Number(restaurant.averageRating || 0);
  const score = Number(restaurant.safetyScore || 0);

  return {
    ...restaurant,
    id,
    _id: undefined,
    __v: undefined,
    location: restaurant.address && restaurant.city ? `${restaurant.address}, ${restaurant.city}` : restaurant.address || "",
    area: restaurant.city || "",
    rating: Number(rating.toFixed(1)),
    reviewCount: Number(restaurant.totalReviews || 0),
    badge: safetyBadge(score)
  };
}

export function serializeDish(dish) {
  return {
    id: asId(dish._id || dish.id),
    restaurantId: asId(dish.restaurantId),
    dishName: dish.dishName,
    description: dish.description || "",
    ingredients: dish.ingredients || [],
    allergens: dish.allergens || []
  };
}

export function serializeReview(review) {
  const user = review.user;
  const restaurant = review.restaurant;

  return {
    id: asId(review._id || review.id),
    userId: asId(user?._id || user || review.userId),
    userName: user?.name || review.userName || "Verified user",
    restaurantId: asId(restaurant?._id || restaurant || review.restaurantId),
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    visitDate: review.visitDate,
    verified: review.verified,
    createdAt: review.createdAt
  };
}

export function serializeReport(report) {
  const restaurant = report.restaurant;
  const user = report.user;

  return {
    id: asId(report._id || report.id),
    restaurantId: asId(restaurant?._id || restaurant || report.restaurantId),
    userId: asId(user?._id || user || report.userId),
    category: report.type || report.category,
    type: report.type || report.category,
    severity: report.severity,
    description: report.description,
    status: report.status,
    createdAt: report.createdAt
  };
}
