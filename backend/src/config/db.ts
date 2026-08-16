import 'dotenv/config'; // Loads the .env file immediately
import mongoose from 'mongoose';

// 1. Read the variable
const mongoURI = process.env.MONGO_URI;

export const connectDB = async () => {
  // FIX: Throw an error if the variable is missing to satisfy TypeScript
  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in the .env file");
  }

  try {
    // TypeScript now knows mongoURI is strictly a string
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};