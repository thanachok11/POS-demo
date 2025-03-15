import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary'; // นำเข้า cloudinary config
import Product from '../models/Product'; // นำเข้า model Product
import Stock from '../models/Stock'; // นำเข้า model Stock
import jwt from 'jsonwebtoken'; // นำเข้า jwt สำหรับการตรวจสอบ token
import User from '../models/User'; // นำเข้า model User
import dotenv from "dotenv";
dotenv.config();

// ฟังก์ชันสำหรับการตรวจสอบ JWT Token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
// Controller สำหรับการเพิ่มสินค้า พร้อมเพิ่มสต็อกสินค้า
export const addProductWithStock = async (req: Request, res: Response): Promise<void> => {
  try {
    // ดึง token จาก headers
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    // ตรวจสอบ token และดึง userId
    const decoded = verifyToken(token);

    if (typeof decoded !== 'string' && 'userId' in decoded) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    // ตรวจสอบว่าไฟล์ถูกส่งมาหรือไม่
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    // อัปโหลดภาพไปที่ Cloudinary
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      async (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: 'Error uploading image'
          });
        }

        // ดึงข้อมูลจาก req.body
        const { name, description, price, category, barcode, quantity, supplier, location, threshold } = req.body;

        try {
          // ✅ 1. สร้างสินค้าใหม่
          const newProduct = new Product({
            name,
            description,
            price,
            category,
            barcode,
            imageUrl: result?.secure_url, // URL ของภาพจาก Cloudinary
            public_id: result?.public_id, // public_id ของ Cloudinary
            userId: decoded.userId, // เก็บ userId ที่มาจาก token
          });

          await newProduct.save();

          // ✅ 2. เพิ่มสต็อกสินค้าใหม่ (อ้างอิง productId)
          const newStock = new Stock({
            productId: newProduct._id,
            userId: decoded.userId, // เชื่อมกับผู้ใช้
            quantity: quantity || 5,
            supplier,
            location,
            threshold: threshold || 5, // ค่าขั้นต่ำเริ่มต้นที่ 5
            barcode,
            status: "สินค้าพร้อมขาย", // เพิ่มเงื่อนไข Low Stock
            lastRestocked: quantity > 0 ? new Date() : undefined,
          });


          await newStock.save();

          res.status(201).json({
            success: true,
            message: 'Product and stock created successfully',
            data: { product: newProduct, stock: newStock }
          });

        } catch (error) {
          console.error(error);
          res.status(500).json({
            success: false,
            message: 'Error saving product and stock'
          });
        }
      }
    ).end(req.file?.buffer); // ส่ง buffer ของไฟล์ไปที่ Cloudinary
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
