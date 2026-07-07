import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Review from "../models/Review.js";
import { ApiError } from "../utils/errors.js";
import { recalculateRestaurantRating } from "./RestaurantService.js";
import { serializeReview } from "./serializers.js";

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid request");
  }
}

export async function upsertReview(user, payload) {
  ensureObjectId(user.id);
  ensureObjectId(payload.restaurantId);

  const restaurantExists = await Restaurant.exists({ _id: payload.restaurantId });
  if (!restaurantExists) throw new ApiError(404, "Restaurant not found");

  const review = await Review.findOneAndUpdate(
    { user: user.id, restaurant: payload.restaurantId },
    {
      user: user.id,
      restaurant: payload.restaurantId,
      rating: payload.rating,
      title: payload.title || "Verified visit",
      comment: payload.comment,
      visitDate: payload.visitDate || new Date(),
      verified: true
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .populate("user", "name")
    .lean();

  await recalculateRestaurantRating(payload.restaurantId);
  return serializeReview(review);
}

export async function deleteReview(userId, restaurantId) {
  ensureObjectId(userId);
  ensureObjectId(restaurantId);

  await Review.deleteOne({ user: userId, restaurant: restaurantId });
  await recalculateRestaurantRating(restaurantId);
}
