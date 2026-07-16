import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";
import { USER_STATUSES } from "../constants/auth.js";
import { ApiError } from "../utils/errors.js";
import { serializeReport, serializeRestaurant, serializeReview } from "./serializers.js";

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid request");
}

function ensureOwnerReady(user) {
  if (user.status === USER_STATUSES.BLOCKED) throw new ApiError(403, "Account is blocked");
  if (user.ownerApprovalStatus !== "approved") throw new ApiError(403, "Owner approval required");
}

async function getOwnedRestaurant(user, restaurantId) {
  ensureOwnerReady(user);
  ensureObjectId(restaurantId);
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: user.id }).lean();
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  return restaurant;
}

const ownerEditableFields = ["description", "phone", "website", "openingHours", "image", "cuisine", "ingredients", "allergens"];

function pickAllowed(payload, allowed) {
  return allowed.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) result[field] = payload[field];
    return result;
  }, {});
}

function normalizeMenuItem(payload, existing = {}) {
  return {
    dishName: payload.dishName ?? existing.dishName,
    description: payload.description ?? existing.description ?? "",
    category: payload.category ?? existing.category ?? "Menu",
    foodType: payload.foodType ?? existing.foodType ?? "veg",
    price: payload.price === "" ? null : payload.price === undefined ? existing.price ?? null : Number(payload.price),
    ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : existing.ingredients || [],
    allergens: Array.isArray(payload.allergens) ? payload.allergens : existing.allergens || [],
    dietaryMarkers: Array.isArray(payload.dietaryMarkers) ? payload.dietaryMarkers : existing.dietaryMarkers || [],
    available: payload.available ?? existing.available ?? true,
    sourceType: "owner_declared",
    dataDisclaimer:
      payload.dataDisclaimer ||
      "Owner-declared ingredient information is intended for dietary and allergen transparency and does not represent a complete recipe or preparation method."
  };
}

export async function getOwnerSummary(user) {
  if (user.status === USER_STATUSES.BLOCKED) throw new ApiError(403, "Account is blocked");
  const restaurants = user.ownerApprovalStatus === "approved"
    ? await Restaurant.find({ owner: user.id }).sort({ name: 1 }).lean()
    : [];
  return {
    approvalStatus: user.ownerApprovalStatus || "pending",
    accountStatus: user.status,
    restaurants: restaurants.map(serializeRestaurant)
  };
}

export async function listOwnerRestaurants(user) {
  ensureOwnerReady(user);
  const restaurants = await Restaurant.find({ owner: user.id }).sort({ name: 1 }).lean();
  return restaurants.map(serializeRestaurant);
}

export async function getOwnerRestaurant(user, restaurantId) {
  const restaurant = await getOwnedRestaurant(user, restaurantId);
  return serializeRestaurant(restaurant);
}

export async function updateOwnerRestaurant(user, restaurantId, payload) {
  await getOwnedRestaurant(user, restaurantId);
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurantId, owner: user.id },
    pickAllowed(payload, ownerEditableFields),
    { new: true, runValidators: true }
  ).lean();
  return serializeRestaurant(restaurant);
}

export async function addMenuItem(user, restaurantId, payload) {
  await getOwnedRestaurant(user, restaurantId);
  if (!payload.dishName) throw new ApiError(400, "Invalid request");
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurantId, owner: user.id },
    { $push: { menuItems: normalizeMenuItem(payload) } },
    { new: true, runValidators: true }
  ).lean();
  return serializeRestaurant(restaurant);
}

export async function updateMenuItem(user, restaurantId, itemId, payload) {
  const ownedRestaurant = await getOwnedRestaurant(user, restaurantId);
  ensureObjectId(itemId);
  const existingItem = ownedRestaurant.menuItems?.find((item) => item._id?.toString() === itemId);
  if (!existingItem) throw new ApiError(404, "Menu item not found");
  const update = normalizeMenuItem(payload, existingItem);
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurantId, owner: user.id, "menuItems._id": itemId },
    { $set: Object.fromEntries(Object.entries(update).map(([key, value]) => [`menuItems.$.${key}`, value])) },
    { new: true, runValidators: true }
  ).lean();
  if (!restaurant) throw new ApiError(404, "Menu item not found");
  return serializeRestaurant(restaurant);
}

export async function deactivateMenuItem(user, restaurantId, itemId) {
  await getOwnedRestaurant(user, restaurantId);
  ensureObjectId(itemId);
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurantId, owner: user.id, "menuItems._id": itemId },
    { $set: { "menuItems.$.available": false } },
    { new: true }
  ).lean();
  if (!restaurant) throw new ApiError(404, "Menu item not found");
  return serializeRestaurant(restaurant);
}

export async function listOwnerReviews(user, restaurantId) {
  await getOwnedRestaurant(user, restaurantId);
  const reviews = await Review.find({ restaurant: restaurantId }).populate("user", "name").sort({ createdAt: -1 }).lean();
  return reviews.map(serializeReview);
}

export async function listOwnerReports(user, restaurantId) {
  await getOwnedRestaurant(user, restaurantId);
  const reports = await Report.find({ restaurant: restaurantId }).sort({ createdAt: -1 }).lean();
  return reports.map((report) => serializeReport(report, { includeUser: false, includeDescription: true }));
}
