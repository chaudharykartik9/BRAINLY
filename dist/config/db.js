import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://tusharkartik06_db_user:YMCNKwfTTjYFqsNd@cluster0.bz2azbh.mongodb.net/Second-brain");
        console.log("MongoDB connected");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
//# sourceMappingURL=db.js.map