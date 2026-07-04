import mongoose from "mongoose";

export const dbState = {
  isMongoConnected: false
};

export async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI not provided. Using in-memory demo data.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    dbState.isMongoConnected = true;
    console.log("MongoDB connected.");
  } catch (error) {
    console.warn("MongoDB connection failed. Falling back to in-memory data.");
    console.warn(error.message);
  }
}
