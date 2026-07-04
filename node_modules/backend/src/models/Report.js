import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["Unhygienic Food", "Allergy Issue", "Food Poisoning", "Wrong Ingredients", "Other"],
      required: true
    },
    description: { type: String, required: true, trim: true },
    image: { type: String },
    status: { type: String, enum: ["Pending", "Reviewed", "Resolved"], default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
