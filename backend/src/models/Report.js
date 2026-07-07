import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["Unhygienic Food", "Allergy Issue", "Food Poisoning", "Wrong Ingredients", "Other"],
      required: true
    },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Reviewed", "Resolved"], default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
