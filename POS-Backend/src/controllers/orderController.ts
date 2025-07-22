import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order, { IOrder } from "../models/order"
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
  const { items, location, supplierCompany, supplierId } = req.body;

  // ตรวจสอบ token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(403).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: "Order ไม่มีรายการสินค้า" });
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

      // ตรวจสอบสินค้าแต่ละรายการใน items
      // map items เป็น array ที่เก็บข้อมูล productId, productName, quantity
      const processedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          res.status(404).json({ success: false, message: `Product ไม่พบ id: ${item.productId}` });
          return;
        }

        if (!item.quantity || item.quantity <= 0) {
          res.status(400).json({ success: false, message: `จำนวนสินค้าไม่ถูกต้องสำหรับ id: ${item.productId}` });
          return;
        }

        processedItems.push({
          productId: product._id,
          productName: product.name,
          quantity: item.quantity,
        });
      }

      // สร้าง order ใหม่
      const newOrder = new Order({
        userId: user._id,
        supplierId,
        supplierCompany,
        location,
        items: processedItems,  // ใส่ array รายการสินค้า
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

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "รอการชำระเงิน",
    "ชำระเงินแล้ว",
    "จัดส่งแล้ว",
    "ยกเลิกแล้ว",
    "กำลังเตรียมจัดส่ง",
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status value" });
    return;
  }

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

      // ถ้าสถานะเปลี่ยนเป็น "ชำระเงินแล้ว" ให้เพิ่ม stock ตามรายการสินค้า
      if (status === "ชำระเงินแล้ว") {
        // กรณี order มี items เป็น array (แบบใหม่)
        if (!order.items || order.items.length === 0) {
          res.status(400).json({ success: false, message: "Order ไม่มีรายการสินค้า" });
          return;
        }

        for (const item of order.items) {
          const stock = await Stock.findOne({
            productId: item.productId,
            userId: order.userId,
          });

          if (stock) {
            stock.quantity += item.quantity;
            stock.lastRestocked = new Date();
            await stock.updateStatus();
          } else {
            const newStock = new Stock({
              productId: item.productId,
              userId: order.userId,
              quantity: item.quantity,
              supplier: order.supplierCompany,
              supplierId: order.supplierId.toString(),
              location: order.location,
              lastRestocked: new Date(),
            });
            await newStock.updateStatus();
          }
        }
      }

      order.status = status;
      await order.save();

      res.status(200).json({
        success: true,
        message: "อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว",
        order,
      });
    } else {
      res.status(401).json({ message: "Token payload is invalid" });
    }
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};