import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, default: "Verified visit", trim: true },
    comment: { type: String, required: true, trim: true },
    visitDate: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
