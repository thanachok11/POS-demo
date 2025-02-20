// routes/orderRoutes.ts
import { Router } from 'express';
import {createOrder} from '../controllers/stockController';

const router = Router();

// route สำหรับการสร้างใบสั่งซื้อ
router.post('/create', createOrder);

// route สำหรับดึงรายการใบสั่งซื้อทั้งหมด

export default router;
