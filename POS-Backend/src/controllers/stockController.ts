import Stock from "../models/Stock";
import { Request, Response } from "express";
import Order from '../models/order';
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


// ฟังก์ชันสำหรับการสร้างใบสั่งซื้อใหม่
export const createOrder = async (req: Request, res: Response) :Promise<void> => {
  const { productId, quantity, supplier, location } = req.body;

  try {
    // ตรวจสอบข้อมูลจาก client
    if (!productId || quantity <= 0 || !supplier || !location) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }

    // สร้างใบสั่งซื้อใหม่
    const newOrder = new Order({
      productId,
      quantity,
      supplier,
      location,
    });

    // บันทึกใบสั่งซื้อใหม่ในฐานข้อมูล
    await newOrder.save();

    // ส่งกลับข้อมูลใบสั่งซื้อที่สร้าง
      res.status(201).json({
      message: 'ใบสั่งซื้อสินค้าถูกสร้างแล้ว',
      order: newOrder,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ' });
    return;
  }
};

// ฟังก์ชันสำหรับดึงรายการใบสั่งซื้อทั้งหมด
export const getOrders = async (req: Request, res: Response):Promise<void> => {
  try {
    const orders = await Order.find().populate('productId');
    res.status(200).json(orders);
    return;
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายการใบสั่งซื้อ' });
    return;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลใบสั่งซื้อโดยใช้ ID
export const getOrderById = async (req: Request, res: Response) :Promise<void> => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate('productId');
    
    if (!order) {
       res.status(404).json({ message: 'ไม่พบใบสั่งซื้อที่ระบุ' });
       return;
    }

     res.status(200).json(order);
     return;
  } catch (err) {
    console.error('Error fetching order by ID:', err);
     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงใบสั่งซื้อ' });
     return;
  }
};