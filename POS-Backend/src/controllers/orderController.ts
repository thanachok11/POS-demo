import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order, { IOrder } from "../models/Order"
import User from "../models/User";
import Product from "../models/Product";
import Stock from "../models/Stock"; // นำเข้า Stock ด้วย

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new Error("Invalid token");
  }
};

export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(403).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
    return;
  }

  try {
    const decoded = verifyToken(token);

    if (typeof decoded !== "string" && "userId" in decoded) {
      const orders = await Order.find({ userId: decoded.userId }).sort({ orderDate: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } else {
      res.status(401).json({ message: "Token payload is invalid" });
    }
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(403).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
    return;
  }

  try {
    const decoded = verifyToken(token);

    if (typeof decoded !== "string" && "userId" in decoded) {
      const order = await Order.findById(id);

      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      // ตรวจสอบว่าเป็นของผู้ใช้นี้จริง
      if (order.userId.toString() !== decoded.userId) {
        res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้" });
        return;
      }

      res.status(200).json({
        success: true,
        order,
      });
    } else {
      res.status(401).json({ message: "Token payload is invalid" });
    }
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId, userId, items, paymentMethod, amount, amountReceived, change } = req.body;

    // 1. สร้าง Order
    const order = await Order.create({
      saleId,
      userId,
      items,
      paymentMethod,
      amount,
      amountReceived,
      change,
    });

    // 2. ลดสต็อก + log
    for (const item of items) {
      const stock = await Stock.findOne({ barcode: item.barcode });
      if (!stock) continue;

      if (stock.quantity < item.quantity) {
        throw new Error(`สินค้า ${item.name} ไม่พอขาย (คงเหลือ ${stock.quantity})`);
      }

      stock.quantity -= item.quantity;
      await stock.updateStatus();
      await stock.save();

      await StockTransaction.create({
        stockId: stock._id,
        productId: stock.productId,
        type: "SALE",
        quantity: item.quantity,
        referenceId: order._id, // ✅ ใช้ ObjectId ของ Order
        userId,
        salePrice: item.price,
        notes: `ขายสินค้าออก (Order ${saleId})`,
      });
    }

    res.status(201).json({ success: true, message: "สร้าง Order สำเร็จ", data: order });
  } catch (error: any) {
    console.error("❌ Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error while creating order" });
  }
};
