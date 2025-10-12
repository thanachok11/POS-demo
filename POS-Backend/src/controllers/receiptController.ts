import { Request, Response } from "express";
import mongoose from "mongoose";
import Receipt, { IReceipt } from "../models/Receipt";
import Stock from "../models/Stock";
import StockTransaction from "../models/StockTransaction";
import Payment from "../models/Payment";
import { verifyToken } from "../utils/auth";

// 📌 ดึงใบเสร็จทั้งหมด + populate ข้อมูลการชำระเงิน
export const getAllReceipts = async (req: Request, res: Response): Promise<void> => {
    try {
        const receipts = await Receipt.find()
            .populate({
                path: "paymentId",
                model: "Payment",
                select: "saleId paymentMethod amount status createdAt employeeName",
            })
            .sort({ timestamp: -1 }); // ✅ เรียงจากใหม่ไปเก่า

        res.status(200).json({ success: true, receipts });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จทั้งหมด",
            error,
        });
    }
};

// 📌 ดึงใบเสร็จตาม paymentId + populate
export const getReceiptByPaymentId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentId } = req.params;

        const receipt = await Receipt.findOne({ paymentId })
            .populate({
                path: "paymentId",
                model: "Payment",
                select: "saleId paymentMethod amount status createdAt employeeName",
            });

        if (!receipt) {
            res.status(404).json({ success: false, message: "ไม่พบใบเสร็จ" });
            return;
        }

        res.status(200).json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงใบเสร็จ",
            error,
        });
    }
};

// 📊 สรุปยอด (คงเดิม)
export const getReceiptSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();

        // ช่วงเวลา
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fields ที่ต้องการ
        const queryFields = "employeeName items totalPrice amountPaid changeAmount timestamp";

        // Query receipts
        const todayReceipts = await Receipt.find({ timestamp: { $gte: startOfToday } }).select(queryFields);
        const weekReceipts = await Receipt.find({ timestamp: { $gte: startOfWeek } }).select(queryFields);
        const monthReceipts = await Receipt.find({ timestamp: { $gte: startOfMonth } }).select(queryFields);

        // รวมยอด
        const calcSummary = (receipts: IReceipt[]) => ({
            totalPrice: receipts.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
            amountPaid: receipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0),
            changeAmount: receipts.reduce((sum, r) => sum + (r.changeAmount || 0), 0),
            count: receipts.length,
            details: receipts.map((r) => ({
                employeeName: r.employeeName,
                timestamp: r.timestamp,
                items: r.items.map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    subtotal: i.subtotal,
                })),
            })),
        });

        res.status(200).json({
            success: true,
            today: calcSummary(todayReceipts),
            thisWeek: calcSummary(weekReceipts),
            thisMonth: calcSummary(monthReceipts),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูล summary",
            error,
        });
    }
};

// 📌 ลบใบเสร็จตาม paymentId
export const deleteReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentId } = req.params;
        const deletedReceipt = await Receipt.findOneAndDelete({ paymentId });

        if (!deletedReceipt) {
            res.status(404).json({ success: false, message: "ไม่พบใบเสร็จ" });
            return;
        }

        res.status(200).json({ success: true, message: "ลบใบเสร็จสำเร็จ" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการลบใบเสร็จ",
            error,
        });
    }
};


export const processCustomerReturn = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        const { barcode, quantity, reason } = req.body;

        if (!barcode || !quantity) {
            res.status(400).json({ success: false, message: "Missing barcode or quantity" });
            return;
        }

        // 🧾 1. หาใบเสร็จที่มีสินค้านี้ (ไม่ใช่ใบคืน)
        const originalReceipt = await Receipt.findOne<IReceipt>({
            "items.barcode": barcode,
            isReturn: { $ne: true },
        }).session(session);

        if (!originalReceipt) {
            res.status(404).json({ success: false, message: "ไม่พบใบเสร็จที่มีสินค้านี้" });
            return;
        }
        const item = originalReceipt.items.find((i: any) => i.barcode === barcode);
        if (!item) {
            res.status(404).json({ success: false, message: "ไม่พบสินค้านี้ในใบเสร็จ" });
            return;
        }

        if (quantity > item.quantity) {
            res.status(400).json({ success: false, message: "จำนวนที่คืนมากกว่าที่ขาย" });
            return;
        }

        // 📦 2. อัปเดตสต็อก (เพิ่มกลับ)
        const stock = await Stock.findOne({ barcode }).session(session);
        if (!stock) {
            res.status(404).json({ success: false, message: "ไม่พบสินค้าในคลัง" });
            return;
        }

        stock.quantity += quantity;
        await stock.save({ session });
        await stock.updateStatus();

        // 📜 3. บันทึก StockTransaction (CUSTOMER RETURN)
        const transaction = await StockTransaction.create(
            [
                {
                    stockId: stock._id,
                    productId: stock.productId,
                    userId: decoded.userId,
                    type: "RETURN",
                    quantity,
                    costPrice: stock.costPrice,
                    salePrice: stock.salePrice,
                    source: "CUSTOMER", // ✅ คืนจากลูกค้า
                    notes: `ลูกค้าคืนสินค้า (${reason || "ไม่ระบุเหตุผล"})`,
                    referenceId: originalReceipt._id,
                },
            ],
            { session }
        );

        // 💰 4. คำนวณยอดคืน
        const refundAmount = item.price * quantity;

        // 🧾 5. สร้าง Payment REFUND
        const refundPayment = await Payment.create(
            [
                {
                    saleId: String(originalReceipt._id),
                    employeeName: originalReceipt.employeeName,
                    paymentMethod: "เงินสด",
                    type: "REFUND",
                    amountReceived: refundAmount,
                    amount: -Math.abs(refundAmount),
                    status: "สำเร็จ",
                    notes: reason || "คืนสินค้า",
                },
            ],
            { session }
        );

        // 🧾 6. สร้างใบเสร็จคืนสินค้า
        const returnReceipt = await Receipt.create(
            [
                {
                    paymentId: refundPayment[0]._id,
                    originalReceiptId: originalReceipt._id,
                    employeeName: originalReceipt.employeeName,
                    items: [
                        {
                            barcode: item.barcode,
                            name: item.name,
                            price: item.price,
                            quantity,
                            subtotal: -refundAmount,
                            profit: -(item.profit || 0) * quantity,
                        },
                    ],
                    totalPrice: -refundAmount,
                    paymentMethod: "เงินสด",
                    amountPaid: refundAmount,
                    changeAmount: 0,
                    isReturn: true,
                    returnReason: reason,
                    timestamp: new Date(),
                    profit: -(item.profit || 0) * quantity,
                },
            ],
            { session }
        );

        // 🔗 7. เชื่อม Payment ↔ Receipt
        refundPayment[0].receiptId = returnReceipt[0]._id as any;
        await refundPayment[0].save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "✅ คืนสินค้าสำเร็จ (เพิ่มกลับเข้าสต็อก)",
            data: {
                returnReceipt: returnReceipt[0],
                refundPayment: refundPayment[0],
                transaction: transaction[0],
                newStockQuantity: stock.quantity,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ processCustomerReturn Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};