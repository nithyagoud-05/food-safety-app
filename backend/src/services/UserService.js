import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { PUBLIC_REGISTRATION_ROLES, USER_ROLES, USER_STATUSES } from "../constants/auth.js";
import { ApiError } from "../utils/errors.js";
import { serializeUser } from "./serializers.js";

function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid request");
  }
}

export async function createUser(payload) {
  const email = payload.email.toLowerCase();
  const role = payload.role || USER_ROLES.USER;

  if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
    throw new ApiError(400, "Invalid registration role");
  }

  const exists = await User.exists({ email });
  if (exists) throw new ApiError(400, "Email already registered");

  const password = await bcrypt.hash(payload.password, 10);
  const status = role === USER_ROLES.RESTAURANT_OWNER ? USER_STATUSES.PENDING : USER_STATUSES.ACTIVE;
  const user = await User.create({
    ...payload,
    email,
    password,
    role,
    status,
    allergies: payload.allergies || [],
    preferences: payload.preferences || []
  });

  return serializeUser(user.toObject());
}

export async function authenticateUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return null;
  const serializedUser = serializeUser(user);

  if (serializedUser.status === USER_STATUSES.BLOCKED) {
    throw new ApiError(403, "Account is blocked");
  }

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? serializedUser : null;
}

export async function findUserById(id) {
  ensureObjectId(id);
  const user = await User.findById(id).select("-password").lean();
  return serializeUser(user);
}

export async function updateUserProfile(id, payload) {
  ensureObjectId(id);
  const user = await User.findByIdAndUpdate(
    id,
    {
      allergies: payload.allergies || [],
      preferences: payload.preferences || []
    },
    { new: true, runValidators: true }
  )
    .select("-password")
    .lean();

  return serializeUser(user);
}
