import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // นำเข้า model User
import Order from '../models/order';

// ตรวจสอบ token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const JWT_SECRET = process.env.JWT_SECRET;  // ดึงค่า SECRET_KEY จาก .env

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity, supplier, location } = req.body;
  
  // ดึง token จาก header
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(403).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });
    return;
  }

  try {
    // ตรวจสอบ token โดยใช้ SECRET_KEY จาก .env
    const decoded = verifyToken(token);  // ใช้ฟังก์ชัน verifyToken
    console.log('Decoded token:', decoded);

    // ตรวจสอบว่า decoded เป็น JwtPayload และมี userId
    if (typeof decoded !== 'string' && 'userId' in decoded) {
      const decodedToken = decoded as jwt.JwtPayload;  // การแปลงประเภทเพื่อให้ TypeScript รู้จัก

      // ตรวจสอบว่า userId ที่มาจาก token มีอยู่จริงในฐานข้อมูล
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const newOrder = new Order({
        quantity,
        supplier,
        location,
        userId: decodedToken.userId, // เก็บ userId ที่มาจาก token
      });

      await newOrder.save();

      res.status(201).json({
        message: 'ใบสั่งซื้อสินค้าถูกสร้างแล้ว',
        order: newOrder,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (err: unknown) {
    console.error('Error creating order:', err);

    // ตรวจสอบข้อผิดพลาดจากการตรวจสอบ token
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token หมดอายุหรือไม่ถูกต้อง' });
    } else if (err instanceof Error) {
      res.status(500).json({ message: `เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ: ${err.message}` });
    } else {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ' });
    }
  }
};
