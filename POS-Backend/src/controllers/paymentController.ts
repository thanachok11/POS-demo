import { Request, Response } from "express";
import Payment from "../models/Payment";

// ฟังก์ชันสำหรับบันทึกข้อมูลการชำระเงิน
export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, customerName, paymentMethod, amount } = req.body;

        if (!orderId || !customerName || !paymentMethod || !amount) {
             res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
            return;
        }

        const newPayment = new Payment({
            orderId,
            customerName,
            paymentMethod,
            amount,
            status: "สำเร็จ",
        });

        await newPayment.save();

        res.status(201).json({ success: true, message: "บันทึกการชำระเงินสำเร็จ", payment: newPayment });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึก", error });
    }
};
