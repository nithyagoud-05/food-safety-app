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
    evidenceImageUrl: { type: String, default: "", trim: true },
    evidenceImageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (urls) => urls.length <= 3,
        message: "A report can include at most 3 evidence images"
      }
    },
    status: { type: String, enum: ["Pending", "Reviewed", "Under Review", "Resolved", "Rejected"], default: "Pending", index: true },
    sourceType: { type: String, enum: ["consumer_report", "annapurna_moderation", "official_regulatory_data"], default: "consumer_report" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    resolutionNote: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
