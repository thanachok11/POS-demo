import express from "express";
import { createPayment, getAllPayments, processRefund  } from "../controllers/paymentController";

const router = express.Router();

router.post("/create", createPayment); // บันทึกการชำระเงิน
router.get("/getPayment", getAllPayments); // ดึงข้อมูลการชำระเงินทั้งหมด
router.post("/refund", processRefund ); // route สำหรับคืนสินค้า

export default router;
