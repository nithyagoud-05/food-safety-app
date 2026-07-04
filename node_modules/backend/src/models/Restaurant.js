import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: String, required: true },
    cuisine: { type: String, required: true },
    rating: { type: Number, default: 0 },
    safetyScore: { type: Number, default: 75 },
    complaintResolution: { type: Number, default: 80 },
    ingredientTransparency: { type: Number, default: 80 }
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
