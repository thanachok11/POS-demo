// routes/productRoutes.ts
import { Router } from 'express';
import { addProduct } from '../controllers/test';

const router = Router();

// POST - เพิ่มสินค้า
router.post('/products', addProduct);

export default router;
