import express from 'express';
import {
  addStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
  getStockByBarcode, updateStockByBarcode,
} from '../controllers/stockController';

const router = express.Router();

// เส้นทางสำหรับการจัดการสินค้า
router.post('/add', addStock);  // เพิ่มสินค้าใหม่
router.get('/', getAllStock);  // ดูสินค้าทั้งหมด
router.get('/:id', getStockById);  // ดูสินค้าโดยใช้ ID
router.put("/:id", updateStock); // อัปเดตจำนวนสินค้า
router.get('/barcode/:barcode', getStockByBarcode);
// อัปเดตข้อมูลสต็อกจาก barcode
router.put('/barcode/:barcode', updateStockByBarcode);
router.delete('/:id', deleteStock);  // ลบสินค้า

export default router;
