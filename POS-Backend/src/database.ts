import mongoose from "mongoose";

// ฟังก์ชันเชื่อมต่อ MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // หยุดโปรแกรมหากไม่สามารถเชื่อมต่อ MongoDB
  }
};
