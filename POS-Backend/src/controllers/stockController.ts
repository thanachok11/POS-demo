import { Request, Response } from 'express';
import Stock from '../models/Stock';

// ฟังก์ชันสำหรับเพิ่มสินค้า
export const addStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, name, quantity, supplier, location, threshold, status, lastRestocked } = req.body;

    // ตรวจสอบว่ามีสินค้าในฐานข้อมูลหรือไม่
    const existingStock = await Stock.findOne({ productId });
    if (existingStock) {
       res.status(400).json({ message: "Stock with this productId already exists." });
       return;
    }

    // สร้างสินค้าใหม่
    const newStock = new Stock({
      productId,
      name,
      quantity,
      supplier,
      location,
      threshold,
      status,
      lastRestocked,
    });

    // บันทึกสินค้าใหม่ในฐานข้อมูล
    await newStock.save();

    // ส่งกลับผลลัพธ์
    res.status(201).json({ message: "Stock added successfully", data: newStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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

// ฟังก์ชันเพื่อแก้ไขข้อมูลสินค้า
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }
    res.status(200).json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error });
  }
};

// ฟังก์ชันเพื่อลบสินค้า
export const deleteStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);
    if (!deletedStock) {
       res.status(404).json({ message: 'Stock not found' });
       return;
    }
    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stock', error });
  }
};
