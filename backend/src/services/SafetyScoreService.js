import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";
import { ApiError } from "../utils/errors.js";

const severityPenalty = {
  Low: 3,
  Medium: 7,
  High: 14,
  Critical: 22
};

const statusMultiplier = {
  Pending: 0.1,
  "Under Review": 1,
  Reviewed: 0.85,
  Resolved: 0.35,
  Rejected: 0
};

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid request");
  }
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function calculateRestaurantSafetyScore(restaurantId) {
  ensureObjectId(restaurantId);

  const [restaurant, reviews, reports] = await Promise.all([
    Restaurant.findById(restaurantId).lean(),
    Review.find({ restaurant: restaurantId }).lean(),
    Report.find({ restaurant: restaurantId }).lean()
  ]);

  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  const triagedReports = reports.filter((report) => ["Under Review", "Reviewed", "Resolved"].includes(report.status));
  const sufficientPublicSignals =
    restaurant.dataProfile !== "public_metadata" || reviews.length >= 3 || triagedReports.length >= 1;

  if (!sufficientPublicSignals) {
    return {
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
    };
  }

  const baseScore = 75;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : Number(restaurant.averageRating || 0);
  const reviewSignal = reviews.length >= 3 || restaurant.dataProfile !== "public_metadata"
    ? Math.max(-10, Math.min(10, Math.round(((averageRating - 3) / 2) * 10)))
    : 0;

  let incidentPenalty = 0;
  let unresolvedPenalty = 0;

  for (const report of reports) {
    const basePenalty = severityPenalty[report.severity] ?? severityPenalty.Medium;
    const multiplier = statusMultiplier[report.status] ?? statusMultiplier.Pending;
    const weightedPenalty = basePenalty * multiplier;
    incidentPenalty += weightedPenalty;
    if (["Under Review", "Reviewed"].includes(report.status)) {
      unresolvedPenalty += Math.ceil(basePenalty * 0.35);
    }
  }

  incidentPenalty = Math.round(Math.min(45, incidentPenalty));
  unresolvedPenalty = Math.round(Math.min(20, unresolvedPenalty));
  const finalScore = clampScore(baseScore + reviewSignal - incidentPenalty - unresolvedPenalty);

  return {
    safetyDataStatus: "calculated",
    safetyScore: finalScore,
    safetyBreakdown: {
      baseScore,
      reviewSignal,
      incidentPenalty,
      unresolvedPenalty,
      finalScore,
      explanation:
        "Starts from a neutral platform baseline, applies a bounded review-quality signal, then subtracts weighted incident penalties based on severity and moderation status."
    }
  };
}

export async function recalculateRestaurantSafetyScore(restaurantId) {
  const result = await calculateRestaurantSafetyScore(restaurantId);
  const update = {
    safetyDataStatus: result.safetyDataStatus,
    safetyBreakdown: result.safetyBreakdown
  };

  if (result.safetyScore === null) {
    update.$unset = { safetyScore: "" };
  } else {
    update.safetyScore = result.safetyScore;
  }

  await Restaurant.findByIdAndUpdate(restaurantId, update, { runValidators: true });
  return result;
}
