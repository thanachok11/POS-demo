// routes/orderRoutes.ts
import { Router } from 'express';
import * as orderController from '../controllers/stockController';

const router = Router();

// route สำหรับการสร้างใบสั่งซื้อ
router.post('/create', orderController.createOrder);

// route สำหรับดึงรายการใบสั่งซื้อทั้งหมด
router.get('/', orderController.getOrders);

// route สำหรับดึงข้อมูลใบสั่งซื้อโดยใช้ ID
router.get('/:id', orderController.getOrderById);

export default router;
