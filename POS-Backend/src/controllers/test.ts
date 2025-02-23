import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'; // ใช้สำหรับตรวจสอบ JWT token
import Product from '../models/Product'; // Model ของสินค้า
import User from '../models/User'; // Model ของผู้ใช้

const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

// POST - เพิ่มข้อมูลสินค้า
export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // ดึง token จาก body ของ request
    const { token, name, price, description } = req.body;

    if (!token) {
       res.status(401).json({ message: 'No token provided' });
       return;
    }

    // ถอดรหัส JWT token และดึง userId
    const decoded = verifyToken(token);

    if (typeof decoded !== 'string' && 'userId' in decoded) {
      const userId = decoded.userId;

      // ตรวจสอบว่า userId ที่ได้จาก token มีอยู่ในฐานข้อมูลหรือไม่
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // ตรวจสอบว่า name, price, description มีข้อมูลครบหรือไม่
      if (!name || !price || !description) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // สร้างสินค้าใหม่
      const newProduct = new Product({
        name,
        price,
        description,
        userId, // เก็บ userId ที่มาจาก token
      });

      // บันทึกสินค้าใน MongoDB
      await newProduct.save();

      // ส่งกลับผลการสร้างสินค้า
      res.status(201).json({ message: 'Product added successfully', product: newProduct });
      return;
    } else {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add product', error });
  }
};
