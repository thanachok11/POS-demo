// routes/productRoutes.ts
import { Router } from 'express';
import { addProduct } from '../controllers/test';

const router = Router();
router.post('/products', addProduct);

export default router;

