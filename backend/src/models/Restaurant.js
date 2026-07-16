import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    dishName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "Menu", trim: true },
    foodType: { type: String, enum: ["veg", "non_veg", "egg"], default: "veg", index: true },
    price: { type: Number, min: 0, default: null },
    ingredients: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }],
    dietaryMarkers: [{ type: String, trim: true }],
    available: { type: Boolean, default: true },
    sourceType: { type: String, enum: ["demo", "owner_declared", "public_metadata"], default: "demo" },
    dataDisclaimer: { type: String, default: "", trim: true }
  },
  { _id: true, timestamps: true }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    cuisine: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    openingHours: { type: String, default: "", trim: true },
    ingredients: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }],
    safetyScore: { type: Number, min: 0, max: 100, default: null },
    safetyDataStatus: {
      type: String,
      enum: ["insufficient_data", "calculated"],
      default: "insufficient_data",
      index: true
    },
    safetyBreakdown: {
      baseScore: { type: Number, default: 75 },
      reviewSignal: { type: Number, default: 0 },
      incidentPenalty: { type: Number, default: 0 },
      unresolvedPenalty: { type: Number, default: 0 },
      finalScore: { type: Number, default: null },
      explanation: { type: String, default: "" }
    },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, min: 0, default: 0 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    menuItems: [menuItemSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    verified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true, index: true },
    dataProfile: {
      type: String,
      enum: ["demo", "public_metadata", "owner_declared"],
      default: "demo",
      index: true
    },
    dataDisclaimer: { type: String, default: "", trim: true },
    metadataSourceName: { type: String, default: "", trim: true },
    metadataSourceUrl: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

restaurantSchema.index({ name: "text", cuisine: "text", city: "text", address: "text" });

export default mongoose.model("Restaurant", restaurantSchema);
