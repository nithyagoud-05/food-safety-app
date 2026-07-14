import mongoose from "mongoose";
import { USER_ROLES, USER_STATUSES } from "../constants/auth.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.ACTIVE,
      index: true
    },
    allergies: [{ type: String, trim: true }],
    preferences: [{ type: String, trim: true }],
    savedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
