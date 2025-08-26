import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { connectDB } from "./database";
import bodyParser from "body-parser";
import Stock from "./routes/stockRoutes";
import orderRoutes from './routes/orderRoutes';
import testRoute from './routes/testRoutes';
import Supplier from "./routes/supplierRoutes";
import employeeRouter from './routes/employeeRouter'; // เชื่อมต่อ router ของพนักงาน
import createPayment from './routes/paymentRouter';
import receiptRoutes from "./routes/receiptRoutes";
import warehouseRoutes from "./routes/warehouseRoutes";

import cors from "cors";


dotenv.config();
const app = express();
const PORT: number = Number(process.env.PORT) || 5000;

// เชื่อมต่อ MongoDB
connectDB();

// สร้าง API สำหรับทดสอบ
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.153:3000','https://ae80-184-82-100-22.ngrok-free.app'], // อนุญาตหลาย origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // อนุญาตเฉพาะ method ที่ระบุ
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Middleware
app.use(express.json());  // ใช้ express.json() เท่านั้น
app.use(bodyParser.json()); // ลบได้

// เปิดใช้งาน CORS
// หรือระบุเฉพาะ Frontend ของคุณ
app.use('/api/test', testRoute);
app.use("/api/products", productRoutes);
app.use("/api/products/barcode", productRoutes);
app.use("/api/category", productRoutes);
app.post("/api/product/upload", uploadRoutes);
app.use("/api/auth", authRoutes);  // ใช้เพียงเส้นทางนี้
app.use("/api/stocks", Stock);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', Supplier)
app.use('/api/employee', employeeRouter);
app.use('/api/payment', createPayment);
app.use("/api/receipts", receiptRoutes);
app.use("/api/warehouses", warehouseRoutes);

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

