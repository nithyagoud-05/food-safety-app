import mongoose from "mongoose";

export const dbState = {
  isMongoConnected: false
};

mongoose.set("bufferCommands", false);

export async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not provided. MongoDB features are unavailable.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    dbState.isMongoConnected = true;
    console.log("MongoDB connected.");
  } catch (error) {
    dbState.isMongoConnected = false;
    console.warn("MongoDB connection failed.");
    console.warn(error.message);
  }
}
