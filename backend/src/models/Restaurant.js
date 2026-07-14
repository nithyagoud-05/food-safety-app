import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    dishName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    ingredients: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }]
  },
  { _id: true }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    cuisine: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    ingredients: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }],
    safetyScore: { type: Number, min: 0, max: 100, default: 75 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, min: 0, default: 0 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    menuItems: [menuItemSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    verified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

restaurantSchema.index({ name: "text", cuisine: "text", city: "text", address: "text" });

export default mongoose.model("Restaurant", restaurantSchema);
