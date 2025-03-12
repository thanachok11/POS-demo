// routes/orderRoutes.ts
import { Router } from 'express';
import {createPayment} from '../controllers/paymentController';

const router = Router();

// route สำหรับการสร้างใบสั่งซื้อ
router.post('/create', createPayment);

// route สำหรับดึงรายการใบสั่งซื้อทั้งหมด

export default router;
