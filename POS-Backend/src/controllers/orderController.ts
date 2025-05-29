import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order from "../models/Order";
import User from "../models/User";
import Product from "../models/Product";

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

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { user,productId, quantity, location, supplierCompany, supplierId } = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(403).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
    return;
  }

  try {
    const decoded = verifyToken(token);

    if (typeof decoded !== "string" && "userId" in decoded) {
      const decodedToken = decoded as jwt.JwtPayload;

      const user = await User.findById(decodedToken.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }

      const newOrder = new Order({
        userId: user._id,    // แก้ชื่อจาก user เป็น userId
        productId,
        productName: product.name,
        quantity,
        supplierId,
        supplierCompany,
        location,
        status: "รอการชำระเงิน",
        orderDate: new Date(),
      });
      await newOrder.save();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: newOrder,
      });
    } else {
      res.status(401).json({ message: "Token payload is invalid" });
    }
  } catch (error) {
    console.error("Create order error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
