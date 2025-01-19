import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { connectDB } from "./database";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// เชื่อมต่อ MongoDB
connectDB();

// สร้าง API สำหรับทดสอบ
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use(cors({
  origin: 'http://localhost:3000', // URL ของ Frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());  // ใช้ express.json() เท่านั้น
app.use(bodyParser.json()); // ลบได้

// เปิดใช้งาน CORS
// หรือระบุเฉพาะ Frontend ของคุณ

app.use("/api/products", productRoutes);
app.use("/api/product/barcode", productRoutes);
app.post("/api/product/upload", uploadRoutes);
app.use("/api/auth", authRoutes);  // ใช้เพียงเส้นทางนี้

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
