import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Order from "../models/order";
import User from "../models/User";
import Product from "../models/Product";
import dotenv from "dotenv";
dotenv.config();


const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity, supplier, location } = req.body;

  // ดึง token จาก header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
    return;
  }

  try {
    // ตรวจสอบ token
    const decoded = verifyToken(token);

    if (typeof decoded !== "string" && "userId" in decoded) {
      const decodedToken = decoded as jwt.JwtPayload;

      // ตรวจสอบว่า userId มีอยู่ในระบบ
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // ตรวจสอบว่าสินค้ามีอยู่ในฐานข้อมูลหรือไม่
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      // ตรวจสอบว่าสินค้าหมดสต็อกหรือไม่
      if (product.stock < quantity) {
        res.status(400).json({
          success: false,
          message: "Stock not sufficient",
        });
        return;
      }

      // สร้างคำสั่งซื้อใหม่
      const newOrder = new Order({
        user: user._id,
        product: productId,
        quantity,
        supplier,
        location,
        status: "รอการชำระเงิน",
        orderDate: new Date(),
      });

      // บันทึกคำสั่งซื้อในฐานข้อมูล
      await newOrder.save();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: newOrder,
      });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
