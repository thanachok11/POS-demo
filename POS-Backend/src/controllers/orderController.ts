import { Request, Response } from "express";
import Order from "../models/Order";
import Stock from "../models/Stock";
import StockTransaction from "../models/StockTransaction";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId, userId, items, paymentMethod, amount, amountReceived, change } = req.body;

        // ✅ 1. สร้าง Order
        const order = await Order.create({
            saleId,
            userId,
            items,
            paymentMethod,
            amount,
            amountReceived,
            change,
        });

        // ✅ 2. ลดสต็อก + log
        for (const item of items) {
            const stock = await Stock.findOne({ barcode: item.barcode });
            if (!stock) continue;

            const qtyToDeduct = Number(item.quantity) || 0;

            if (qtyToDeduct <= 0) continue;

            if (stock.totalQuantity < qtyToDeduct) {
                throw new Error(`สินค้า ${item.name} ไม่พอขาย (คงเหลือ ${stock.totalQuantity})`);
            }

            // ✅ ลดจำนวนสินค้าคงเหลือ
            stock.totalQuantity -= qtyToDeduct;
            await stock.updateStatus();
            await stock.save();

            // ✅ log การขาย
            await StockTransaction.create({
                stockId: stock._id,
                productId: stock.productId,
                type: "SALE",
                quantity: qtyToDeduct, 
                referenceId: order._id,
                userId,
                salePrice: item.price,
                notes: `ขายสินค้าออก (Order ${saleId})`,
            });

            console.log(`📦 Stock Updated: ${item.name}`);
        }

        res.status(201).json({ success: true, message: "สร้าง Order สำเร็จ", data: order });
    } catch (error: any) {
        console.error("❌ Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error while creating order" });
    }
};
