import { Request, Response } from "express";
import Receipt from "../models/Receipt";

// 📌 ฟังก์ชันดึงใบเสร็จทั้งหมด
export const getAllReceipts = async (req: Request, res: Response): Promise<void> => {
    try {
        const receipts = await Receipt.find();
        res.status(200).json({ success: true, receipts });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error });
    }
};

// 📌 ฟังก์ชันดึงใบเสร็จตาม `saleId`
export const getReceiptBySaleId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId } = req.params;
        const receipt = await Receipt.findOne({ saleId });

        if (!receipt) {
            res.status(404).json({ success: false, message: "ไม่พบใบเสร็จ" });
            return;
        }

        res.status(200).json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงใบเสร็จ", error });
    }
};

// 📌 ฟังก์ชันลบใบเสร็จตาม `saleId`
export const deleteReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId } = req.params;
        const deletedReceipt = await Receipt.findOneAndDelete({ saleId });

        if (!deletedReceipt) {
            res.status(404).json({ success: false, message: "ไม่พบใบเสร็จ" });
            return;
        }

        res.status(200).json({ success: true, message: "ลบใบเสร็จสำเร็จ" });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลบใบเสร็จ", error });
    }
};
