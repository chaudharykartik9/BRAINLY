import mongoose from "mongoose";

export const connectDB = async () => {
  try {

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};