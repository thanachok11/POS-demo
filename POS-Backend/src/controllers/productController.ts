import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Stock from '../models/Stock';

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



// ฟังก์ชันสำหรับการเพิ่มสินค้าใน Stock
export const addProductToStock = async (req: Request, res: Response) => {
  const { productId, stockId, quantity } = req.body;

  try {
    if (!productId || !stockId || quantity <= 0) {
      return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    // ตรวจสอบสินค้าและ Stock ก่อน
    const product = await Product.findById(productId);
    const stock = await Stock.findById(stockId);

    if (!product || !stock) {
      return res.status(404).json({ message: 'ไม่พบสินค้า หรือคลังสินค้า' });
    }

    // เพิ่มสินค้าเข้าใน Stock
    const newProductStock = new Product({
      productId,
      stockId,
      quantity,
    });

    await newProductStock.save();

    return res.status(201).json({ message: 'เพิ่มสินค้าใน Stock สำเร็จ', newProductStock });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้าใน Stock' });
  }
};

// ฟังก์ชันสำหรับเพิ่มสินค้าใหม่
export const addProduct = async (req: Request, res: Response) : Promise<void> =>  {
  const { name, price, description, imageUrl } = req.body;

  try {
    // สร้างสินค้าขึ้นมาในฐานข้อมูล
    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl,
    });

    await newProduct.save();

      res.status(201).json({
      message: 'เพิ่มสินค้าสำเร็จ',
      product: newProduct,
      
    });
    return;
  } catch (error) {
     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า', error });
     return;
  }
};

