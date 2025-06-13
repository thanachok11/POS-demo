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

mongoose.connection.once('open', async () => {
  try {
    await mongoose.connection.collection('suppliers').dropIndex('email_1');
    console.log('ลบ unique index email_1 ใน suppliers เรียบร้อยแล้ว');
  } catch (error) {
    if (error instanceof Error) {
      console.log('ไม่พบ index หรือมีปัญหาในการลบ index:', error.message);
    } else {
      console.log('ไม่พบ index หรือมีปัญหาในการลบ index:', error);
    }
  }
});

