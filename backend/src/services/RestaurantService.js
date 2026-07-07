import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";
import { ApiError } from "../utils/errors.js";
import { serializeDish, serializeReport, serializeRestaurant, serializeReview } from "./serializers.js";

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid request");
  }
}

function buildSearchFilter(search) {
  if (!search) return {};
  const pattern = new RegExp(search, "i");
  return {
    $or: [{ name: pattern }, { cuisine: pattern }, { city: pattern }, { address: pattern }]
  };
}

export async function getRestaurants(query = {}) {
  const restaurants = await Restaurant.find(buildSearchFilter(query.search)).sort({ safetyScore: -1, name: 1 }).lean();
  return restaurants.map(serializeRestaurant);
}

export async function getRestaurantById(id) {
  ensureObjectId(id);

  const [restaurant, reviews, reports] = await Promise.all([
    Restaurant.findById(id).lean(),
    Review.find({ restaurant: id }).populate("user", "name").sort({ createdAt: -1 }).lean(),
    Report.find({ restaurant: id }).sort({ createdAt: -1 }).lean()
  ]);

  if (!restaurant) return null;

  const serializedRestaurant = serializeRestaurant(restaurant);
  const menuItems = restaurant.menuItems?.length
    ? restaurant.menuItems
    : [
        {
          _id: restaurant._id,
          dishName: restaurant.name,
          description: restaurant.description,
          ingredients: restaurant.ingredients || [],
          allergens: restaurant.allergens || []
        }
      ];

  return {
    ...serializedRestaurant,
    dishes: menuItems.map((dish) => serializeDish({ ...dish, restaurantId: restaurant._id })),
    reviews: reviews.map(serializeReview),
    safetyHistory: reports.map(serializeReport)
  };
}

export async function createRestaurant(payload) {
  const restaurant = await Restaurant.create(payload);
  return serializeRestaurant(restaurant.toObject());
}

export async function recalculateRestaurantRating(restaurantId) {
  ensureObjectId(restaurantId);

  const stats = await Review.aggregate([
    { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: "$restaurant", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
  ]);

  const averageRating = stats[0]?.averageRating || 0;
  const totalReviews = stats[0]?.totalReviews || 0;

  await Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews
    },
    { runValidators: true }
  );
}
