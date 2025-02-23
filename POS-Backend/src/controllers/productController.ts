import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import jwt from 'jsonwebtoken'; // นำเข้า jwt สำหรับการตรวจสอบ token
import User from '../models/User'; // นำเข้า model User

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
// ฟังก์ชันค้นหาสินค้าจาก barcode
export const getProductByBarcode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const barcode = req.params.barcode; // ดึง barcode จาก URL params

    // ค้นหาสินค้าจาก barcode
    const product = await Product.findOne({ barcode });

    if (!product) {
      // หากไม่พบสินค้า, ส่ง status 404
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // หากพบสินค้า, ส่ง status 200 พร้อมข้อมูลสินค้า
    res.status(200).json(product);
  } catch (error) {
    // หากเกิดข้อผิดพลาดภายใน, ส่ง status 500
    res.status(500).json({ message: 'Server error', error });
  }
};


export const getProducts = async (req: Request, res: Response): Promise<void> =>  {
  const token = req.header('Authorization')?.split(' ')[1]; // ดึง token จาก header

  if (!token) {
     res.status(401).json({
      success: false,
      message: 'Unauthorized, no token provided'
    });
    return;
  }

  try {
    // ตรวจสอบ token
    const decoded = verifyToken(token);

    if (typeof decoded !== 'string' && 'userId' in decoded) {
      const userId = decoded.userId;

      // ดึงข้อมูลของผู้ใช้จากฐานข้อมูล
      const user = await User.findById(userId);
      if (!user) {
          res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return ;
      }

      // ดึงข้อมูลสต็อกสินค้าจากฐานข้อมูลตาม userId
      const product = await Product.find({ userId: userId }); // Assuming 'Stock' model has a 'userId' field
        res.status(200).json({
        success: true,
        data: product
      });
      return;
    } else {
       res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
  } catch (error) {
    console.error(error);
     res.status(403).json({
      success: false,
      message: 'Forbidden, invalid token'
    });
    return
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find(); // ค้นหาสินค้าทั้งหมดจาก MongoDB

    // ส่งข้อมูลสินค้าทั้งหมดกลับไปในรูปแบบ JSON
    res.json(products);
  } catch (error) {
    // หากเกิดข้อผิดพลาดภายใน, ส่ง status 500
    res.status(500).json({ message: 'Server error', error });
  }
};

