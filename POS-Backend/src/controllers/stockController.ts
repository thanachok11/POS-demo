import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Stock from '../models/Stock';  // Assuming you have a Stock model

// ฟังก์ชันสำหรับการตรวจสอบ JWT Token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// ฟังก์ชันเพื่อดึงข้อมูลสต็อกสินค้าตาม userId
export const getStocks = async (req: Request, res: Response): Promise<void> =>  {
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
      const stocks = await Stock.find({ userId: userId }); // Assuming 'Stock' model has a 'userId' field
        res.status(200).json({
        success: true,
        data: stocks
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



// ค้นหาสต็อกสินค้าจาก barcode
export const getStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params; // ดึงค่า barcode จาก URL params

    // ค้นหาสต็อกจาก barcode
    const stock = await Stock.findOne({ barcode }).populate('productId');
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }

    // ส่งข้อมูลสต็อกกลับไปยังผู้ใช้ พร้อมกับจำนวนสินค้าในสต็อก
    res.json({
      barcode: stock.barcode,
      stockQuantity: stock.quantity, // จำนวนสินค้าที่มีในสต็อก
      product: stock.productId, // ข้อมูลสินค้า (เช่น ชื่อ, ราคา ฯลฯ)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;  // รับ barcode จาก URL params
    const { quantity, supplier, location, threshold, status } = req.body; // รับข้อมูลที่ต้องการอัปเดต

    // ค้นหาสต็อกจาก Barcode
    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }

    // ตรวจสอบว่า quantity ที่ได้รับไม่เป็นลบและไม่เกินจำนวนที่มีอยู่
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity <= 0) {
        res.status(400).json({ message: 'Quantity must be a positive number' });
        return;
      }
      const updatedQuantity = stock.quantity - quantity;
      if (updatedQuantity < 0) {
        res.status(400).json({ message: 'Not enough stock available' });
        return;
      }
      stock.quantity = updatedQuantity;  // ลดจำนวนสต็อกตามที่ซื้อไป
    }

    // อัปเดตข้อมูลอื่น ๆ ถ้ามี
    stock.supplier = supplier || stock.supplier;
    stock.location = location || stock.location;
    stock.threshold = threshold !== undefined ? threshold : stock.threshold;
    stock.status = status || stock.status;

    // บันทึกการเปลี่ยนแปลง
    await stock.save();

    // ส่งข้อมูลที่อัปเดตกลับ
    res.json({ message: 'Stock updated successfully', stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



// 📌 ลบรายการสินค้าออกจาก Stock
export const deleteStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Stock.findByIdAndDelete(id);
    res.json({ message: "ลบสินค้าออกจากสต็อกเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบสต็อกสินค้า" });
  }
};


export const updateQuantityByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.body;  // รับ barcode จาก URL params

    const { quantity } = req.body;

    // ค้นหาสต็อกจาก barcode
    const stock = await Stock.findOne({ barcode });

    if (!stock) {
       res.status(404).json({ success: false, message: "ไม่พบข้อมูลสต็อก" });
      return;
    }

    // ตรวจสอบว่าสินค้ามีจำนวนพอหรือไม่
    if (stock.quantity < quantity) {
       res.status(400).json({
        success: false,
        message: `สินค้าในสต็อกไม่เพียงพอ (เหลือ ${stock.quantity} ชิ้น)`
      });
      return;
    }

    // ลดจำนวนสต็อก
    stock.quantity -= quantity;
    await stock.save();

      res.status(200).json({
      success: true,
      message: "อัปเดตสต็อกสำเร็จ",
      data: stock
    });
    return;

  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};
