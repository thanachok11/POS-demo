import express from "express";
import {
    getAllReceipts,
    getReceiptByPaymentId,
    deleteReceipt,
    getReceiptSummary,
    getReceiptBySaleId,
} from "../controllers/receiptController";

const router = express.Router();

router.get("/sales-summary", getReceiptSummary);          // 🔹 ดึงใบเสร็จทั้งหมด
router.get("/getReceipt", getAllReceipts);          // 🔹 ดึงใบเสร็จทั้งหมด
router.get("/paymentId/:paymentId", getReceiptByPaymentId); // 🔹 ดึงใบเสร็จจาก saleId
router.delete("/:paymentId", deleteReceipt);   // 🔹 ลบใบเสร็จตาม saleId
router.get("/receipt/:saleId", getReceiptBySaleId);

export default router;