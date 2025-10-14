import { Request, Response } from "express";
import mongoose from "mongoose";
import Receipt, { IReceipt } from "../models/Receipt";
import Stock from "../models/Stock";
import StockTransaction from "../models/StockTransaction";
import Payment from "../models/Payment";
import { verifyToken } from "../utils/auth";
// ✅ ฟังก์ชันสำหรับสร้างการชำระเงิน (ทั้งขายและคืนสินค้า)
export const createPayment = async (req: Request, res: Response): Promise<void> => {
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

        const {
            saleId,
            employeeName,
            paymentMethod,
            amountReceived,
            amount,
            items,
            isReturn = false, // ✅ เพิ่ม flag สำหรับใบคืนสินค้า
            reason,
        } = req.body;

        if (!saleId || !employeeName || !paymentMethod || !amount || !items) {
            res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
            return;
        }

        // ✅ ประเภทการชำระเงิน (ขายหรือคืน)
        const paymentType = isReturn ? "REFUND" : "SALE";

        // ✅ 1. สร้างข้อมูล Payment
        const newPayment = new Payment({
            saleId,
            employeeName,
            paymentMethod,
            type: paymentType,
            amountReceived,
            amount: isReturn ? -Math.abs(amount) : Math.abs(amount), // 💵 ถ้าเป็นคืน ให้ติดลบ
            status: "สำเร็จ",
            notes: isReturn ? `คืนสินค้า (${reason || "ไม่ระบุเหตุผล"})` : undefined,
        });

        await newPayment.save();

        // ✅ 2. คำนวณยอดรวม / เงินทอน
        const totalPrice = items.reduce((total: number, item: any) => total + item.subtotal, 0);
        let changeAmount = 0;
        if (!isReturn && paymentMethod === "เงินสด" && amountReceived) {
            changeAmount = amountReceived - totalPrice;
        }

        // ✅ 3. สร้างใบเสร็จ
        const newReceipt = new Receipt({
            paymentId: newPayment._id,
            employeeName,
            items,
            totalPrice: isReturn ? -Math.abs(totalPrice) : Math.abs(totalPrice),
            paymentMethod,
            amountPaid: amountReceived,
            changeAmount,
            timestamp: new Date(),
            profit: isReturn
                ? -items.reduce((sum: number, i: any) => sum + (i.profit || 0), 0)
                : items.reduce((sum: number, i: any) => sum + (i.profit || 0), 0),
            ...(isReturn && { isReturn: true, returnReason: reason }),
        });

        await newReceipt.save();

        // ✅ 4. อัปเดต Payment ให้ชี้กลับ Receipt
        newPayment.receiptId = newReceipt._id;
        await newPayment.save();

        // ✅ 5. ส่งผลลัพธ์กลับ
        res.status(201).json({
            success: true,
            message: isReturn
                ? "✅ บันทึกการคืนสินค้าและใบเสร็จสำเร็จ"
                : "✅ บันทึกการขายและใบเสร็จสำเร็จ",
            payment: newPayment,
            receipt: newReceipt,
        });
    } catch (error) {
        console.error("❌ Error in createPayment:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึก", error });
    }
};

// ✅ ฟังก์ชันสำหรับดึงข้อมูลการชำระเงินทั้งหมด
export const getAllPayments = async (_: Request, res: Response): Promise<void> => {
    try {
        const payments = await Payment.find().populate("receiptId").sort({ createdAt: -1 });

        if (!payments.length) {
            res.status(404).json({ success: false, message: "ไม่พบข้อมูลการชำระเงิน" });
            return;
        }

        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        console.error("Error retrieving all payments:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน", error });
    }
};

export const processRefund = async (req: Request, res: Response): Promise<void> => {
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

        const { saleId, reason } = req.body;
        if (!saleId) {
            res.status(400).json({ success: false, message: "กรุณาระบุรหัสการขายหรือรหัสใบเสร็จ" });
            return;
        }

        let payment;

        // ✅ ตรวจว่าค่า saleId เป็น ObjectId ของ Receipt หรือไม่
        const isObjectId = mongoose.Types.ObjectId.isValid(saleId);
        if (isObjectId) {
            // ถ้าเป็น ObjectId → หาใบเสร็จ แล้วดึง paymentId จากในนั้น
            const receipt = await Receipt.findById(saleId).session(session);
            if (!receipt) {
                res.status(404).json({ success: false, message: "ไม่พบใบเสร็จนี้" });
                return;
            }
            payment = await Payment.findById(receipt.paymentId).session(session);
        } else {
            // ถ้าเป็นเลขขาย → หา Payment จาก saleId ปกติ
            payment = await Payment.findOne({ saleId }).session(session);
        }

        if (!payment) {
            res.status(404).json({ success: false, message: "ไม่พบข้อมูลการชำระเงินของรหัสนี้" });
            return;
        }

        // 🧾 หาใบเสร็จต้นฉบับ
        const originalReceipt = await Receipt.findOne({
            paymentId: payment._id,
            isReturn: false,
        })
            .populate("paymentId")
            .session(session);

        if (!originalReceipt) {
            res.status(404).json({ success: false, message: "ไม่พบใบเสร็จต้นฉบับของการขายนี้" });
            return;
        }

        // 💰 คำนวณยอดคืน
        const refundAmount = originalReceipt.totalPrice;

        // 📦 คืนสินค้าทั้งหมดในใบเสร็จ
        for (const item of originalReceipt.items) {
            const stock = await Stock.findOne({ barcode: item.barcode }).session(session);
            if (!stock) continue;

            stock.totalQuantity += item.quantity;
            await stock.save({ session });
            await stock.updateStatus();

            await StockTransaction.create(
                [
                    {
                        stockId: stock._id,
                        productId: stock.productId,
                        userId: decoded.userId,
                        type: "RETURN",
                        quantity: item.quantity,
                        costPrice: stock.costPrice,
                        salePrice: item.price,
                        source: "CUSTOMER",
                        notes: `คืนสินค้าทั้งใบเสร็จ (${reason || "ไม่ระบุเหตุผล"})`,
                        referenceId: originalReceipt._id,
                    },
                ],
                { session }
            );
        }

        // 💳 สร้าง Payment ใหม่ (REFUND)
        const [refundPayment] = await Payment.create(
            [
                {
                    saleId: payment.saleId,
                    employeeName: originalReceipt.employeeName,
                    paymentMethod: "เงินสด",
                    type: "REFUND",
                    amountReceived: refundAmount,
                    amount: -Math.abs(refundAmount),
                    status: "สำเร็จ",
                    notes: reason || "คืนสินค้าทั้งใบเสร็จ",
                },
            ],
            { session }
        );

        // 🧾 สร้าง Receipt ใหม่ (ใบคืนสินค้า)
        const [returnReceipt] = await Receipt.create(
            [
                {
                    paymentId: refundPayment._id,
                    originalReceiptId: originalReceipt._id,
                    employeeName: originalReceipt.employeeName,
                    items: originalReceipt.items.map((item: any) => ({
                        barcode: item.barcode,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: -Math.abs(item.subtotal),
                        profit: -(item.profit || 0),
                    })),
                    totalPrice: -Math.abs(originalReceipt.totalPrice),
                    paymentMethod: "เงินสด",
                    amountPaid: refundAmount,
                    changeAmount: 0,
                    isReturn: true,
                    returnReason: reason,
                    timestamp: new Date(),
                    profit: -(originalReceipt.profit || 0),
                },
            ],
            { session }
        );

        // 🔗 เชื่อม Payment ↔ Receipt
        refundPayment.receiptId = returnReceipt._id as any;
        await refundPayment.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "✅ คืนสินค้าสำเร็จ (ออกใบเสร็จคืนสินค้าใหม่)",
            data: {
                originalReceipt,
                returnReceipt,
                refundPayment,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ processRefund Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
