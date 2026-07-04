import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    allergies: [{ type: String, trim: true }],
    preferences: [{ type: String, trim: true }],
    savedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
