import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Report from "../models/Report.js";
import { ApiError } from "../utils/errors.js";
import { recalculateRestaurantSafetyScore } from "./SafetyScoreService.js";
import { serializeReport } from "./serializers.js";

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid request");
  }
}

export async function createReport(user, payload) {
  ensureObjectId(user.id);
  ensureObjectId(payload.restaurantId);

  const restaurantExists = await Restaurant.exists({ _id: payload.restaurantId });
  if (!restaurantExists) throw new ApiError(404, "Restaurant not found");

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicateActiveReport = await Report.exists({
    restaurant: payload.restaurantId,
    user: user.id,
    type: payload.category || payload.type,
    status: { $in: ["Pending", "Under Review"] },
    createdAt: { $gte: since }
  });
  if (duplicateActiveReport) {
    throw new ApiError(400, "A similar active report was already submitted recently");
  }

  const report = await Report.create({
    restaurant: payload.restaurantId,
    user: user.id,
    type: payload.category || payload.type,
    severity: payload.severity || "Medium",
    description: payload.description,
    evidenceImageUrl: payload.evidenceImageUrl || payload.image || "",
    status: "Pending",
    sourceType: "consumer_report"
  });

  await recalculateRestaurantSafetyScore(payload.restaurantId);
  return serializeReport(report.toObject());
}

export async function listReports() {
  const reports = await Report.find()
    .populate("restaurant", "name address city")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();
  return reports.map((report) => serializeReport(report, { includeUser: true, includeInternalNotes: true }));
}
