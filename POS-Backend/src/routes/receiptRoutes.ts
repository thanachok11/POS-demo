import express from "express";
import {
    getAllReceipts,
    getReceiptByPaymentId,
    deleteReceipt
} from "../controllers/receiptController";

const router = express.Router();

// 📌 เส้นทางสำหรับจัดการใบเสร็จ
router.get("/", getAllReceipts);          // 🔹 ดึงใบเสร็จทั้งหมด
router.get("/:paymentId", getReceiptByPaymentId); // 🔹 ดึงใบเสร็จจาก saleId
router.delete("/:paymentId", deleteReceipt);   // 🔹 ลบใบเสร็จตาม saleId

export default router;
