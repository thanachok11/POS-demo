import { Request, Response } from "express";
import Payment from "../models/Payment";
import Receipt from "../models/Receipt";
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
