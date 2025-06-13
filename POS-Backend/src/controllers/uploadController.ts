import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary'; // นำเข้า cloudinary config
import Product from '../models/Product'; // นำเข้า model Product
import Stock from '../models/Stock'; // นำเข้า model Stock
import jwt from 'jsonwebtoken'; // นำเข้า jwt สำหรับการตรวจสอบ token
import User from '../models/User'; // นำเข้า model User
import Supplier from '../models/Supplier';
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
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const decoded = verifyToken(token);

    if (typeof decoded === 'string' || !('userId' in decoded)) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      async (err, result) => {
        if (err || !result) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Error uploading image' });
          return;
        }

        const { name, description, price, category, barcode, quantity, supplierCompany, location, threshold } = req.body;
        // ถ้าไม่ได้ส่ง barcode มาให้ระบบ gen อัตโนมัติ
        let finalBarcode = barcode;
        if (!finalBarcode || finalBarcode.trim() === '') {
          // ตัวอย่างการ gen barcode อัตโนมัติแบบสุ่ม 13 หลัก
          finalBarcode = `BC${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
        }

        // ✅ ค้นหาบริษัทก่อนสร้าง product
        const supplierDoc = await Supplier.findById(req.body.supplierId);
        if (!supplierDoc) {
          res.status(400).json({
            success: false,
            message: `ไม่พบบริษัทผู้จัดจำหน่าย`
          });
          return;
        }

        try {
          // ✅ สร้างสินค้าใหม่พร้อม supplierId
          const newProduct = new Product({
            name,
            description,
            price,
            category,
            barcode: finalBarcode,
            imageUrl: result?.secure_url,
            public_id: result?.public_id,
            userId: decoded.userId,
            supplierId: supplierDoc._id, // สำคัญ
          });

          await newProduct.save();

          // ไม่ต้องหาอีกรอบจากชื่อบริษัทแล้ว

          // ✅ สร้าง Stock ใหม่โดยใช้ supplierDoc เดิม
          const newStock = new Stock({
            productId: newProduct._id,
            userId: decoded.userId,
            quantity: quantity || 5,
            supplierId: supplierDoc._id,
            supplier: supplierDoc.companyName,
            location,
            threshold: threshold || 5,
            barcode: finalBarcode,
            status: "สินค้าพร้อมขาย",
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
    ).end(req.file.buffer); // ✅ ส่ง buffer ไป Cloudinary

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};