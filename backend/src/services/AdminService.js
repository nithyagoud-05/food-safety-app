import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { USER_ROLES, USER_STATUSES } from "../constants/auth.js";
import { ApiError } from "../utils/errors.js";
import { recalculateRestaurantRating } from "./RestaurantService.js";
import { recalculateRestaurantSafetyScore } from "./SafetyScoreService.js";
import { serializeReport, serializeRestaurant, serializeReview, serializeUser } from "./serializers.js";

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid request");
}

const restaurantEditableFields = [
  "name",
  "image",
  "address",
  "city",
  "cuisine",
  "description",
  "phone",
  "website",
  "openingHours",
  "latitude",
  "longitude",
  "dataProfile",
  "dataDisclaimer",
  "metadataSourceName",
  "metadataSourceUrl",
  "ingredients",
  "allergens",
  "menuItems"
];

function pickAllowed(payload, allowed) {
  return allowed.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) result[field] = payload[field];
    return result;
  }, {});
}

export async function getAdminOverview() {
  const [users, restaurants, reports] = await Promise.all([
    User.find().lean(),
    Restaurant.find().lean(),
    Report.find().lean()
  ]);

  return {
    totalUsers: users.length,
    blockedUsers: users.filter((user) => (user.status || USER_STATUSES.ACTIVE) === USER_STATUSES.BLOCKED).length,
    pendingOwners: users.filter((user) => user.role === USER_ROLES.RESTAURANT_OWNER && user.ownerApprovalStatus === "pending").length,
    totalRestaurants: restaurants.length,
    activeRestaurants: restaurants.filter((restaurant) => restaurant.isActive !== false).length,
    verifiedRestaurants: restaurants.filter((restaurant) => restaurant.verified).length,
    insufficientSafetyData: restaurants.filter((restaurant) => restaurant.safetyDataStatus !== "calculated").length,
    pendingReports: reports.filter((report) => report.status === "Pending").length,
    underReviewReports: reports.filter((report) => ["Under Review", "Reviewed"].includes(report.status)).length,
    resolvedReports: reports.filter((report) => report.status === "Resolved").length,
    highSeverityUnresolved: reports.filter(
      (report) => ["High", "Critical"].includes(report.severity) && ["Pending", "Under Review", "Reviewed"].includes(report.status)
    ).length
  };
}

export async function listUsers() {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  return users.map(serializeUser);
}

export async function approveOwner(userId, adminId) {
  ensureObjectId(userId);
  const user = await User.findById(userId);
  if (!user || user.role !== USER_ROLES.RESTAURANT_OWNER) throw new ApiError(400, "Invalid owner account");
  if (user.status === USER_STATUSES.BLOCKED) throw new ApiError(403, "Account is blocked");
  user.ownerApprovalStatus = "approved";
  user.status = USER_STATUSES.ACTIVE;
  user.ownerApprovedAt = new Date();
  user.ownerApprovedBy = adminId;
  user.ownerRejectedAt = null;
  user.ownerRejectedBy = null;
  await user.save();
  return serializeUser(user.toObject());
}

export async function rejectOwner(userId, adminId) {
  ensureObjectId(userId);
  const user = await User.findById(userId);
  if (!user || user.role !== USER_ROLES.RESTAURANT_OWNER) throw new ApiError(400, "Invalid owner account");
  if (user.status === USER_STATUSES.BLOCKED) throw new ApiError(403, "Account is blocked");
  user.ownerApprovalStatus = "rejected";
  user.status = USER_STATUSES.PENDING;
  user.ownerRejectedAt = new Date();
  user.ownerRejectedBy = adminId;
  user.ownerApprovedAt = null;
  user.ownerApprovedBy = null;
  await user.save();
  await Restaurant.updateMany({ owner: user._id }, { $unset: { owner: "" } });
  return serializeUser(user.toObject());
}

export async function blockUser(userId, actingAdminId) {
  ensureObjectId(userId);
  if (userId === actingAdminId) throw new ApiError(403, "Admins cannot block their own account");
  const target = await User.findById(userId).lean();
  if (!target) throw new ApiError(404, "User not found");
  if (target.role === USER_ROLES.ADMIN) throw new ApiError(403, "Admin accounts cannot be managed by generic block actions");
  const user = await User.findByIdAndUpdate(userId, { status: USER_STATUSES.BLOCKED }, { new: true }).select("-password").lean();
  if (!user) throw new ApiError(404, "User not found");
  return serializeUser(user);
}

export async function unblockUser(userId) {
  ensureObjectId(userId);
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === USER_ROLES.ADMIN) throw new ApiError(403, "Admin accounts cannot be managed by generic block actions");
  user.status = user.role === USER_ROLES.RESTAURANT_OWNER && user.ownerApprovalStatus !== "approved" ? USER_STATUSES.PENDING : USER_STATUSES.ACTIVE;
  await user.save();
  return serializeUser(user.toObject());
}

export async function listRestaurantsForAdmin() {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 }).lean();
  return restaurants.map(serializeRestaurant);
}

export async function createRestaurantForAdmin(payload) {
  const neutralImage =
    payload.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80";
  const restaurant = await Restaurant.create({
    ...pickAllowed(payload, restaurantEditableFields),
    image: neutralImage,
    dataProfile: payload.dataProfile || "public_metadata",
    safetyDataStatus: "insufficient_data",
    safetyScore: null,
    safetyBreakdown: {
      baseScore: 75,
      reviewSignal: 0,
      incidentPenalty: 0,
      unresolvedPenalty: 0,
      finalScore: null,
      explanation: "Insufficient Annapurna platform signals are available for a calculated score."
    }
  });
  return serializeRestaurant(restaurant.toObject());
}

export async function updateRestaurantForAdmin(id, payload) {
  ensureObjectId(id);
  const restaurant = await Restaurant.findByIdAndUpdate(id, pickAllowed(payload, restaurantEditableFields), {
    new: true,
    runValidators: true
  }).lean();
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  return serializeRestaurant(restaurant);
}

export async function deactivateRestaurant(id) {
  ensureObjectId(id);
  const restaurant = await Restaurant.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  return serializeRestaurant(restaurant);
}

export async function setRestaurantVerification(id, adminId, verified) {
  ensureObjectId(id);
  const restaurant = await Restaurant.findByIdAndUpdate(
    id,
    { verified, verifiedAt: verified ? new Date() : null, verifiedBy: verified ? adminId : null },
    { new: true }
  ).lean();
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  return serializeRestaurant(restaurant);
}

export async function assignRestaurantOwner(restaurantId, ownerId) {
  ensureObjectId(restaurantId);
  ensureObjectId(ownerId);
  const owner = await User.findById(ownerId).lean();
  if (
    !owner ||
    owner.role !== USER_ROLES.RESTAURANT_OWNER ||
    owner.status === USER_STATUSES.BLOCKED ||
    owner.ownerApprovalStatus !== "approved"
  ) {
    throw new ApiError(400, "Owner is not eligible for assignment");
  }
  const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, { owner: ownerId }, { new: true }).lean();
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  return serializeRestaurant(restaurant);
}

export async function updateReportStatus(reportId, adminId, payload) {
  ensureObjectId(reportId);
  const allowed = ["Pending", "Under Review", "Resolved", "Rejected", "Reviewed"];
  if (!allowed.includes(payload.status)) throw new ApiError(400, "Invalid request");
  const allowedSeverity = ["Low", "Medium", "High", "Critical"];
  if (payload.severity && !allowedSeverity.includes(payload.severity)) throw new ApiError(400, "Invalid request");
  const report = await Report.findByIdAndUpdate(
    reportId,
    {
      status: payload.status,
      ...(payload.severity ? { severity: payload.severity } : {}),
      resolutionNote: payload.resolutionNote || "",
      reviewedBy: adminId,
      reviewedAt: new Date()
    },
    { new: true, runValidators: true }
  ).lean();
  if (!report) throw new ApiError(404, "Report not found");
  await recalculateRestaurantSafetyScore(report.restaurant);
  return serializeReport(report, { includeUser: true, includeInternalNotes: true });
}

export async function deleteReviewForModeration(reviewId) {
  ensureObjectId(reviewId);
  const review = await Review.findByIdAndDelete(reviewId).lean();
  if (!review) throw new ApiError(404, "Review not found");
  await recalculateRestaurantRating(review.restaurant);
  await recalculateRestaurantSafetyScore(review.restaurant);
  return { deleted: true };
}

export async function listReviewsForAdmin() {
  const reviews = await Review.find().populate("user", "name").populate("restaurant", "name").sort({ createdAt: -1 }).lean();
  return reviews.map(serializeReview);
}
