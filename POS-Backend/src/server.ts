import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";

// Routes & DB
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { connectDB } from "./database";
import Stock from "./routes/stockRoutes";
import orderRoutes from './routes/orderRoutes';
import Supplier from "./routes/supplierRoutes";
import StockTransaction from "./routes/stockTransactionRoutes";
import employeeRouter from './routes/employeeRoutes';
import createPayment from './routes/paymentRouter';
import receiptRoutes from "./routes/receiptRoutes";
import warehouseRoutes from "./routes/warehouseRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import purchaseOrderRouter from "./routes/purchaseOrderRoutes";
import dashboardRoutes from './routes/dashboardRoutes';
import discountRoute from './routes/discountRoutes';
import qcRoutes from "./routes/qcRoutes";

// Models
import StockModel from "./models/Stock";

dotenv.config();
const app = express();
const server = http.createServer(app); 

// ✅ ต้องอยู่ก่อน route ทั้งหมด
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.1.153:3000",
    "https://ae80-184-82-100-22.ngrok-free.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://192.168.1.153:3000',
      'https://ae80-184-82-100-22.ngrok-free.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

const PORT: number = Number(process.env.PORT) || 5000;

// ============================
// CONNECT DATABASE
// ============================
connectDB();

// ============================
// SOCKET.IO SETUP
// ============================
io.on("connection", (socket) => {
  console.log("⚡️ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Watch changes in Stock collection (Real-time)
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected — watching stock changes...");
  const changeStream = StockModel.watch();

  changeStream.on("change", async (change) => {
    if (["update", "replace", "insert"].includes(change.operationType)) {
      const updatedDoc = await StockModel.findById(change.documentKey._id).populate("productId");
      if (updatedDoc) {
        console.log(`📦 Stock Updated: ${updatedDoc.productId?.name || updatedDoc.barcode}`);
        io.emit("stockUpdated", updatedDoc); // 🔥 ส่ง event ให้ frontend
      }
    }
  });
});

// ============================
// ROUTES
// ============================
app.get("/", (req, res) => {
  res.send(`<h1>API is running...</h1>`);
});

app.use(express.json());
app.use(bodyParser.json());
app.use("/api/products", productRoutes);
app.use("/api/products/barcode", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stocks", Stock);
app.use('/api/suppliers', Supplier);
app.use('/api/employee', employeeRouter);
app.use('/api/payment', createPayment);
app.use("/api/receipts", receiptRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stock", StockTransaction);
app.use("/api/", purchaseOrderRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discounts', discountRoute);
app.use("/api/qc", qcRoutes);
app.use('/api/', orderRoutes);

// ============================
// START SERVER
// ============================
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
