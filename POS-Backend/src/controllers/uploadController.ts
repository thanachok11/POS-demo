import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary'; // นำเข้า cloudinary config
import Product from '../models/Product'; // นำเข้า model Product
import Stock from '../models/Stock'; // นำเข้า model Stock
import jwt from 'jsonwebtoken'; // นำเข้า jwt สำหรับการตรวจสอบ token
import User from '../models/User'; // นำเข้า model User
import Supplier from '../models/Supplier';
import Warehouse  from "../models/Warehouse"; // ✅ เพิ่ม import
import mongoose from "mongoose";

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

        const {
          name,
          description,
          price,
          category,
          barcode,
          quantity,
          location,
          threshold,
          supplierId,
          unit, // 👈 รับ unit จาก body (ควรเป็น array หรือ string)
        } = req.body;

        // แปลง unit ให้แน่ใจว่าเป็น array
        const unitArray = typeof unit === 'string' ? [unit] : Array.isArray(unit) ? unit : [];

        // ตรวจสอบหรือสร้าง barcode
        let finalBarcode = barcode;
        if (!finalBarcode || finalBarcode.trim() === '') {
          finalBarcode = `BC${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
        }

        // ค้นหา Supplier
        const supplierDoc = await Supplier.findById(supplierId);
        if (!supplierDoc) {
          res.status(400).json({ success: false, message: 'ไม่พบบริษัทผู้จัดจำหน่าย' });
          return;
        }

        // ค้นหา Warehouse จากชื่อสถานที่
        const warehouseDoc = await Warehouse.findOne({ location });
        if (!warehouseDoc) {
          res.status(400).json({ success: false, message: `ไม่พบคลังสินค้าที่ชื่อ "${location}"` });
          return;
        }

        // สร้าง Product
        const newProduct = new Product({
          name,
          description,
          price,
          category,
          barcode: finalBarcode,
          imageUrl: result.secure_url,
          public_id: result.public_id,
          userId: decoded.userId,
          supplierId: supplierDoc._id,
        });

        await newProduct.save();

        // สร้าง Stock
        const newStock = new Stock({
          productId: newProduct._id,
          userId: decoded.userId,
          quantity: quantity || 5,
          supplierId: supplierDoc._id,
          supplier: supplierDoc.companyName,
          location: warehouseDoc._id,
          threshold: threshold || 5,
          barcode: finalBarcode,
          status: "สินค้าพร้อมขาย",
          lastRestocked: quantity > 0 ? new Date() : undefined,
          unit: unitArray, // ✅ เพิ่ม unit array
        });

        await newStock.save();

        res.status(201).json({
          success: true,
          message: 'Product and stock created successfully',
          data: { product: newProduct, stock: newStock }
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Controller สำหรับการแก้ไขสินค้าและสต็อก
export const updateProductWithStock = async (req: Request, res: Response): Promise<void> => {
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

    const {
      productId: rawProductId,
      name,
      description,
      price,
      category,
      barcode,
      quantity,
      location, // ✅ อาจจะเป็น _id หรือ string
      threshold,
      supplierId,
      unit,
    } = req.body;

    // ✅ ตรวจสอบ productId
    const productId = String(rawProductId);
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: 'Invalid productId' });
      return;
    }

    // ✅ ค้นหา Product
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
      return;
    }

    // ✅ ค้นหา Stock
    const stock = await Stock.findOne({ productId: product._id });
    if (!stock) {
      res.status(404).json({ success: false, message: 'ไม่พบสต็อกของสินค้า' });
      return;
    }

    // ✅ ค้นหา Supplier
    const supplierDoc = await Supplier.findById(supplierId || product.supplierId);
    if (!supplierDoc) {
      res.status(400).json({ success: false, message: 'ไม่พบบริษัทผู้จัดจำหน่าย' });
      return;
    }

    // ✅ ค้นหา Warehouse
    let warehouseDoc = stock.location; // ค่าเดิม
    if (location) {
      let foundWarehouse = null;

      if (mongoose.Types.ObjectId.isValid(location)) {
        // ถ้าเป็น ObjectId
        foundWarehouse = await Warehouse.findById(location);
      } else {
        // ถ้าเป็น string → หาในฟิลด์ location ของ Warehouse
        foundWarehouse = await Warehouse.findOne({ location });
      }

      if (!foundWarehouse) {
        res.status(400).json({ success: false, message: `ไม่พบคลังสินค้าที่ "${location}"` });
        return;
      }
      warehouseDoc = foundWarehouse._id;
    }

    // ✅ unit → array
    const unitArray =
      typeof unit === 'string'
        ? [unit]
        : Array.isArray(unit)
          ? unit
          : stock.unit || [];

    // ✅ ฟังก์ชันอัปเดต
    const updateProductData = async (imageUrl?: string, public_id?: string) => {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? Number(price) : product.price;
      product.category = category || product.category;
      product.barcode = barcode ? String(barcode) : product.barcode;
      product.supplierId = supplierDoc._id;

      if (imageUrl && public_id) {
        // ลบรูปเก่าใน cloudinary ถ้ามี
        if (product.public_id) {
          await cloudinary.uploader.destroy(product.public_id);
        }
        product.imageUrl = imageUrl;
        product.public_id = public_id;
      }

      await product.save();

      // อัปเดต Stock
      stock.quantity = quantity !== undefined ? Number(quantity) : stock.quantity;
      stock.threshold = threshold !== undefined ? Number(threshold) : stock.threshold;
      stock.supplierId = supplierDoc._id;
      stock.supplier = supplierDoc.companyName;
      stock.location = warehouseDoc; // ✅ เก็บ ObjectId
      stock.unit = unitArray;
      stock.barcode = product.barcode;
      if (quantity !== undefined && Number(quantity) > 0) {
        stock.lastRestocked = new Date();
      }

      await stock.save();

      res.status(200).json({
        success: true,
        message: 'Product and stock updated successfully',
        data: { product, stock },
      });
    };

    // ✅ มีไฟล์รูปใหม่
    if (req.file) {
      cloudinary.uploader
        .upload_stream({ resource_type: 'auto' }, async (err, result) => {
          if (err || !result) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error uploading image' });
            return;
          }
          await updateProductData(result.secure_url, result.public_id);
        })
        .end(req.file.buffer);
    } else {
      // ✅ ไม่มีไฟล์ → update ข้อมูลอย่างเดียว
      await updateProductData();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
