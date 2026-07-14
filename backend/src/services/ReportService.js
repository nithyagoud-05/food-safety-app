import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Report from "../models/Report.js";
import { ApiError } from "../utils/errors.js";
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

  const report = await Report.create({
    restaurant: payload.restaurantId,
    user: user.id,
    type: payload.category || payload.type,
    severity: payload.severity || "Medium",
    description: payload.description,
    status: "Pending"
  });

  return serializeReport(report.toObject());
}

export async function listReports() {
  const reports = await Report.find()
    .populate("restaurant", "name address city")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();
  return reports.map((report) => serializeReport(report, { includeUser: true }));
}
