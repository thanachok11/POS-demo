import { Request, Response } from "express";
import Payment from "../models/Payment";
import Receipt from "../models/Receipt"; // Import Receipt model

// ฟังก์ชันสำหรับบันทึกข้อมูลการชำระเงิน
export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId, employeeName, paymentMethod,amountReceived, amount, items } = req.body;

        if (!saleId || !employeeName || !paymentMethod || !amount || !items) {
            res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
            return;
        }

        // สร้างข้อมูลการชำระเงินใหม่
        const newPayment = new Payment({
            saleId,
            employeeName,
            paymentMethod,
            amountReceived,
            amount,
            status: "สำเร็จ",
        });

        // บันทึกการชำระเงิน
        await newPayment.save();

        // คำนวณ totalPrice โดยการรวม subtotal ของทุก item
        const totalPrice = items.reduce((total: number, item: any) => total + item.subtotal, 0);

        // คำนวณเงินทอน (สำหรับการชำระเงินแบบเงินสด)
        let changeAmount = 0;
        if (paymentMethod === "เงินสด" && amountReceived) {
            changeAmount = amountReceived - totalPrice;
        }

        // สร้างใบเสร็จ
        const newReceipt = new Receipt({
            paymentId: newPayment._id,  // เชื่อมโยงกับการชำระเงิน
            employeeName,
            items,
            totalPrice,
            paymentMethod,
            amountPaid: amountReceived,
            changeAmount,
            timestamp: new Date(),
        });

        // บันทึกใบเสร็จลงในฐานข้อมูล
        await newReceipt.save();

        // ส่งผลลัพธ์กลับไปที่ client
        res.status(201).json({
            success: true,
            message: "บันทึกการชำระเงินและสร้างใบเสร็จสำเร็จ",
            payment: newPayment,
            receipt: newReceipt
        });
    } catch (error) {
        console.error("Error in payment and receipt creation:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึก", error });
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลการชำระเงินทั้งหมด
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const payments = await Payment.find(); // ดึงข้อมูลการชำระเงินทั้งหมดจากฐานข้อมูล

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
