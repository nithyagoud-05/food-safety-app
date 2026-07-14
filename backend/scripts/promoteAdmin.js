import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import { USER_ROLES, USER_STATUSES } from "../src/constants/auth.js";

dotenv.config();

const email = process.argv[2]?.trim().toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function main() {
  if (!email || !emailPattern.test(email)) {
    throw new Error("Usage: npm run promote-admin -- user@example.com");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  const wasAdmin = user.role === USER_ROLES.ADMIN;
  user.role = USER_ROLES.ADMIN;
  if (user.status !== USER_STATUSES.BLOCKED) {
    user.status = USER_STATUSES.ACTIVE;
  }

  await user.save();

  const statusNote = user.status === USER_STATUSES.BLOCKED ? " Account remains blocked." : "";
  console.log(`${wasAdmin ? "User is already admin" : "User promoted to admin"}: ${email}.${statusNote}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
