import { Request, Response } from "express";
import User from "../models/User";
import Employee from "../models/Employee";
import Stock from "../models/Stock";
import Product from "../models/Product";
import StockTransaction from "../models/StockTransaction";
import { verifyToken } from "../utils/auth";


//หาค่า ownerId จาก userId (รองรับ admin / employee)
const getOwnerId = async (userId: string): Promise<string> => {
  let user = await User.findById(userId);
  if (!user) {
    user = await Employee.findById(userId);
  }
  if (!user) throw new Error("User not found");

  if (user.role === "admin") {
    return user._id.toString();
  } else if (user.role === "employee") {
    if (!user.adminId) throw new Error("Employee does not have admin assigned");
    return user.adminId.toString();
  } else {
    throw new Error("Invalid user role");
  }
};

// ดึง stock ทั้งหมด
export const getStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized, no token provided" });
      return;
    }

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !("userId" in decoded)) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }

    const ownerId = await getOwnerId(decoded.userId);

    const stocks = await Stock.find({ userId: ownerId })
      .populate({
        path: "productId",
        populate: { path: "category" }
      })
      .populate("supplierId")
      .populate("location");

    res.status(200).json({ success: true, data: stocks });
  } catch (error) {
    console.error("Get Stocks Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching stocks" });
  }
};


//ดึง stock ตาม barcode
export const getStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const stock = await Stock.findOne({ barcode }).populate("productId");

    if (!stock) {
      res.status(404).json({ success: false, message: "Stock not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        barcode: stock.barcode,
        stockQuantity: stock.quantity,
        product: stock.productId,
      },
    });
  } catch (error) {
    console.error("Get Stock By Barcode Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching stock" });
  }
};

//อัปเดต Stock (กรณีแก้ไขข้อมูลโดยตรง เช่น threshold, location)
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const { quantity, supplier, location, threshold, status } = req.body;

    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ success: false, message: "Stock not found with this barcode" });
      return;
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        res.status(400).json({ success: false, message: "Quantity must be non-negative number" });
        return;
      }
      stock.quantity = parsedQuantity;
    }

    if (supplier !== undefined) stock.supplier = supplier;
    if (location !== undefined) stock.location = location;
    if (threshold !== undefined) stock.threshold = threshold;
    if (status !== undefined) stock.status = status;

    await stock.updateStatus();
    await stock.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ success: false, message: "Server error while updating stock" });
  }
};


//ใช้เวลานำเข้าสินค้า → เพิ่มสต็อก + log ลง StockTransaction
export const restockProductByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const { quantity, costPrice, userId, purchaseOrderId } = req.body;

    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ success: false, message: "Stock not found" });
      return;
    }

    stock.quantity += quantity;
    stock.lastPurchasePrice = costPrice;
    stock.costPrice = costPrice;
    stock.lastRestocked = new Date();
    await stock.updateStatus();
    await stock.save();

    await StockTransaction.create({
      stockId: stock._id,
      productId: stock.productId,
      type: "RESTOCK",
      quantity,
      referenceId: purchaseOrderId,
      userId,
      costPrice,
      notes: "นำเข้าสินค้าใหม่",
    });

    res.status(200).json({ success: true, message: "นำเข้าสินค้าสำเร็จ", data: stock });
  } catch (error) {
    console.error("Restock Product Error:", error);
    res.status(500).json({ success: false, message: "Server error while restocking product" });
  }
};

// คืนสินค้า
export const returnProductByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const { quantity, userId, orderId } = req.body;

    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ success: false, message: "Stock not found" });
      return;
    }

    stock.quantity += quantity;
    await stock.updateStatus();
    await stock.save();

    await StockTransaction.create({
      stockId: stock._id,
      productId: stock.productId,
      type: "RETURN",
      quantity,
      referenceId: orderId,
      userId,
      notes: "คืนสินค้า",
    });

    res.status(200).json({ success: true, message: "คืนสินค้าสำเร็จ", data: stock });
  } catch (error) {
    console.error("Return Product Error:", error);
    res.status(500).json({ success: false, message: "Server error while returning product" });
  }
};

// ปรับสต็อก (เช่น ตรวจนับใหม่)
export const adjustStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const { newQuantity, userId, notes } = req.body;

    const stock = await Stock.findOne({ barcode });
    if (!stock) {
      res.status(404).json({ success: false, message: "Stock not found" });
      return;
    }

    stock.quantity = newQuantity;
    await stock.updateStatus();
    await stock.save();

    await StockTransaction.create({
      stockId: stock._id,
      productId: stock.productId,
      type: "ADJUSTMENT",
      quantity: newQuantity,
      userId,
      notes: notes || "ปรับยอดสต็อก",
    });

    res.status(200).json({ success: true, message: "ปรับสต็อกสำเร็จ", data: stock });
  } catch (error) {
    console.error("Adjust Stock Error:", error);
    res.status(500).json({ success: false, message: "Server error while adjusting stock" });
  }
};

//ลบ Stock (พร้อมลบ Product ที่ผูก)
export const deleteStockByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;

    const deletedStock = await Stock.findOneAndDelete({ barcode });
    if (!deletedStock) {
      res.status(404).json({ success: false, message: "Stock not found with this barcode" });
      return;
    }

    const deletedProduct = await Product.findOneAndDelete({ barcode });

    res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
      productDeleted: !!deletedProduct,
    });
  } catch (error) {
    console.error("Delete Stock Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting stock and product" });
  }
};
