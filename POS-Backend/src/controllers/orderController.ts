import { Request, Response } from "express";
import Order from "../models/Order";
import Stock from "../models/Stock";
import StockTransaction from "../models/StockTransaction";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId, userId, items, paymentMethod, amount, amountReceived, change } = req.body;

        // 1. สร้าง Order
        const order = await Order.create({
            saleId,
            userId,
            items,
            paymentMethod,
            amount,
            amountReceived,
            change,
        });

        // 2. ลดสต็อก + log
        for (const item of items) {
            const stock = await Stock.findOne({ barcode: item.barcode });
            if (!stock) continue;

            if (stock.quantity < item.quantity) {
                throw new Error(`สินค้า ${item.name} ไม่พอขาย (คงเหลือ ${stock.quantity})`);
            }

            stock.quantity -= item.quantity;
            await stock.updateStatus();
            await stock.save();

            await StockTransaction.create({
                stockId: stock._id,
                productId: stock.productId,
                type: "SALE",
                quantity: item.quantity,
                referenceId: order._id, // ✅ ใช้ ObjectId ของ Order
                userId,
                salePrice: item.price,
                notes: `ขายสินค้าออก (Order ${saleId})`,
            });
        }

        res.status(201).json({ success: true, message: "สร้าง Order สำเร็จ", data: order });
    } catch (error: any) {
        console.error("❌ Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error while creating order" });
    }
};