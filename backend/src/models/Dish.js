import mongoose from "mongoose";

const dishSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    dishName: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

export default mongoose.model("Dish", dishSchema);
