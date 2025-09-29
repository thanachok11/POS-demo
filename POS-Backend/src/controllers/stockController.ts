import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Stock from '../models/Stock';  // Assuming you have a Stock model
import Employee from '../models/Employee'; // แก้ path ตามโฟลเดอร์ของคุณ

// ฟังก์ชันสำหรับการตรวจสอบ JWT Token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// ฟังก์ชันเพื่อดึงข้อมูลสต็อกสินค้าตาม userId
export const getStocks = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized, no token provided',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);

    if (typeof decoded !== 'string' && 'userId' in decoded) {
      const userId = decoded.userId;

      // ลองหาใน User ก่อน ถ้าไม่เจอค่อยหาใน Employee
      let user = await User.findById(userId);
      if (!user) {
        user = await Employee.findById(userId);
      }

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      let ownerId: string;

      if (user.role === 'admin') {
        ownerId = user._id.toString();
      } else if (user.role === 'employee') {
        if (!user.adminId) {
          res.status(400).json({
            success: false,
            message: 'Employee does not have an admin assigned',
          });
          return;
        }
        ownerId = user.adminId.toString();
      } else {
        res.status(403).json({
          success: false,
          message: 'Invalid user role',
        });
        return;
      }

      // ดึงสต็อกสินค้าจาก userId ของ admin
      const stocks = await Stock.find({ userId: ownerId }).populate('productId');

      res.status(200).json({
        success: true,
        data: stocks,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(403).json({
      success: false,
      message: 'Forbidden, invalid token',
    });
  }
};
export const getStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized, no token provided' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    if (typeof decoded !== 'string' && 'userId' in decoded) {
      const userId = decoded.userId;

      // ลองหาใน User ก่อน ถ้าไม่เจอค่อยหาใน Employee
      let user = await User.findById(userId);
      if (!user) {
        user = await Employee.findById(userId);
      }

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      let ownerId: string;

      if (user.role === 'admin') {
        ownerId = user._id.toString();
      } else if (user.role === 'employee') {
        if (!user.adminId) {
          res.status(400).json({ message: 'Employee does not have an admin assigned' });
          return;
        }
        ownerId = user.adminId.toString();
      } else {
        res.status(403).json({ message: 'Invalid user role' });
        return;
      }

      const { barcode } = req.params;

      // ค้นหา stock ที่ตรงกับ barcode และเป็นของเจ้าของ (admin)
      const stock = await Stock.findOne({ barcode, userId: ownerId }).populate('productId');

      if (!stock) {
        res.status(404).json({ message: 'Stock not found' });
        return;
      }

      res.json({
        barcode: stock.barcode,
        stockQuantity: stock.quantity,
        product: stock.productId,
      });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const { quantity, supplier, location, threshold, status } = req.body;

    // ค้นหาสต็อกจาก Barcode
    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ message: "Stock not found" });
      return;
    }

    // อัปเดตจำนวนสต็อก (สามารถเพิ่ม/ลด/แก้ตรง ๆ ได้)
    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity < 0) {
        res.status(400).json({ message: "Quantity must be a non-negative number" });
        return;
      }
      stock.quantity = quantity;
    }

    // อัปเดต field อื่น ๆ ถ้ามี
    if (supplier !== undefined) stock.supplier = supplier;
    if (location !== undefined) stock.location = location;
    if (threshold !== undefined) stock.threshold = threshold;
    if (status !== undefined) stock.status = status;

    // บันทึกการเปลี่ยนแปลง
    await stock.save();

    res.json({ message: "Stock updated successfully", stock });
    return;
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};


// ✅ Update Stock by ID
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    let { quantity, supplier, location, threshold, status } = req.body;

    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ success: false, message: "Stock not found with this barcode" });
      return;
    }

    // ✅ แปลง quantity ให้เป็น number ถ้ามาเป็น string
    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        res.status(400).json({ success: false, message: "Quantity must be a non-negative number" });
        return;
      }
      stock.quantity = parsedQuantity;
    }

    if (supplier !== undefined) stock.supplier = supplier;
    if (location !== undefined) stock.location = location;
    if (threshold !== undefined) stock.threshold = threshold;
    if (status !== undefined) stock.status = status;

    await stock.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully by barcode",
      data: stock,
    });
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ success: false, message: "Server error while updating stock" });
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

export const deleteStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;

    const deleted = await Stock.findOneAndDelete({ barcode });
    if (!deleted) {
      res.status(404).json({ success: false, message: "Stock not found with this barcode" });
      return;
    }

    res.status(200).json({ success: true, message: "Stock deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Stock Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting stock" });
  }
};