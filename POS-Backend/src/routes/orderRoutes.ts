// routes/orderRoutes.ts
import { Router } from 'express';
import {
    createOrder,
    getOrdersByUser,
    getOrderById,
    updateOrderStatus
} from "../controllers/orderController";

const router = Router();

router.post("/create", createOrder);
router.get("/", getOrdersByUser);         // ดึงทั้งหมด
router.get("/orders/:id", getOrderById);        // ดึงเฉพาะ ID
router.put("/:id/status", updateOrderStatus);  // แก้สถานะ

// route สำหรับดึงรายการใบสั่งซื้อทั้งหมด

export default router;
