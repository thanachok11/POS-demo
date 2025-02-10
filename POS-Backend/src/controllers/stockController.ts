import Stock from "../models/Stock";
import { Request, Response } from "express";

// 📌 ดึงข้อมูล Stock ทั้งหมด
export const getStock = async (req: Request, res: Response) => {
  try {
    const stocks = await Stock.find().populate("productId");
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสต็อก" });
  }
};


// ค้นหาสต็อกสินค้าจาก barcode
export const getStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;

    // ค้นหาจาก barcode
    const stock = await Stock.findOne({ barcode }).populate('productId');
    if (!stock) {
       res.status(404).json({ message: 'Stock not found' });
        return;
    }

    res.json(stock);
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



// เพิ่ม Stock ใหม่พร้อม barcode
export const addStock = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, barcode, supplier, location, threshold, status } = req.body;

    // สร้าง Stock ใหม่
    const newStock = new Stock({
      productId,
      quantity,
      barcode,
      supplier,
      location,
      threshold,
      status,
    });

    // บันทึกลงฐานข้อมูล
    await newStock.save();

    res.status(201).json({ message: 'Stock added successfully', newStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// 📌 อัปเดต Stock (เมื่อมีการขายสินค้า)
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const stock = await Stock.findById(id);
    if (!stock) {
      res.status(404).json({ error: "ไม่พบสินค้าในสต็อก" });
      return; // ต้องอยู่ภายใน if
    }

    stock.quantity = quantity;
    stock.status = quantity === 0 ? "Out of Stock" : quantity < stock.threshold ? "Low Stock" : "In Stock";
    await stock.save();

    res.json({ message: "อัปเดตสต็อกเรียบร้อย", stock });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตสต็อก" });
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


// ฟังก์ชันเพื่อดูสินค้าทั้งหมด
export const getAllStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stocks', error });
  }
};

// ฟังก์ชันเพื่อดูรายละเอียดของสินค้าตาม ID
export const getStockById = async (req: Request, res: Response): Promise<void> =>{
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock by id', error });
  }
};

