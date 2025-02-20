import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary'; // นำเข้า cloudinary config
import Product from '../models/Product'; // นำเข้า model Product
import jwt from 'jsonwebtoken'; // นำเข้า jwt สำหรับการตรวจสอบ token
import User from '../models/User'; // นำเข้า model User

// ฟังก์ชันสำหรับการตรวจสอบ JWT Token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
// Controller สำหรับการอัปโหลดภาพและบันทึกข้อมูล Product
export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // ดึง token จาก body (ถ้าส่งใน body) หรือ จาก headers (ถ้าส่งใน headers)
    const token = req.headers['authorization']?.split(' ')[1] || req.body.token;

    if (!token) {
        res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return ;
    }

    // ตรวจสอบ token และดึง userId
    const decoded = verifyToken(token);  // ถอดรหัส token

    if (typeof decoded !== 'string' && 'userId' in decoded) {
      // ตรวจสอบว่า userId ที่มาจาก token มีอยู่จริงในฐานข้อมูล
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

    // ใช้ cloudinary.v2.uploader.upload_stream
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
        // สร้างข้อมูล Product ใหม่
        const { name, description, price, category, barcode, stock } = req.body;

        try {
          const newProduct = new Product({
            name,
            description,
            price,
            category,
            barcode,
            imageUrl: result?.secure_url, // บันทึก URL ของภาพจาก Cloudinary
            public_id: result?.public_id, // บันทึก public_id ของ Cloudinary
            userId: decoded.userId, // เก็บ userId ที่มาจาก token
          });

          await newProduct.save();

          res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
          });

        } catch (error) {
          console.error(error);
          res.status(500).json({
            success: false,
            message: 'Error saving product'
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


