import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary'; // นำเข้า cloudinary config
import Product from '../models/Product'; // นำเข้า model Product

// Controller สำหรับการอัปโหลดภาพและบันทึกข้อมูล Product
export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
      res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  // ใช้ cloudinary.v2.uploader.upload_stream
  cloudinary.uploader.upload_stream(
    { resource_type: 'auto' },
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Error uploading image"
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
          stock,
          imageUrl: result?.secure_url,  // บันทึก URL ของภาพจาก Cloudinary
          public_id: result?.public_id,  // บันทึก public_id ของ Cloudinary
        });

        await newProduct.save();

        res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: newProduct
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: "Error saving product"
        });
      }
    }
  ).end(req.file?.buffer); // ส่ง buffer ของไฟล์ไปที่ Cloudinary
};
