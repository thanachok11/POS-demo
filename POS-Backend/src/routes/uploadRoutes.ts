import { Router } from 'express';
import { addProductWithStock } from '../controllers/uploadController'; // นำเข้าคอนโทรลเลอร์
import upload from '../middlewares/uploadMiddleware'; // นำเข้า middleware สำหรับอัปโหลดไฟล์
const router = Router();

// Route สำหรับการอัปโหลดภาพของสินค้า
router.post('/api/product/upload', upload.single('image'), addProductWithStock);

export default router;
