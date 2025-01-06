import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';


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
