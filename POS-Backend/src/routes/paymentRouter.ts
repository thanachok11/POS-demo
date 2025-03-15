import express from "express";
import { createPayment, getAllPayments } from "../controllers/paymentController";

const router = express.Router();

router.post("/create", createPayment); // บันทึกการชำระเงิน
router.get("/all", getAllPayments); // ดึงข้อมูลการชำระเงินทั้งหมด

export default router;
