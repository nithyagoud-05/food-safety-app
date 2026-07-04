import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
