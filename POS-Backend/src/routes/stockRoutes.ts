import express from 'express';
import {
  addStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
} from '../controllers/stockController';

const router = express.Router();

// เส้นทางสำหรับการจัดการสินค้า
router.post('/add', addStock);  // เพิ่มสินค้าใหม่
router.get('/', getAllStock);  // ดูสินค้าทั้งหมด
router.get('/:id', getStockById);  // ดูสินค้าโดยใช้ ID
router.put('/:id', updateStock);  // แก้ไขสินค้า
router.delete('/:id', deleteStock);  // ลบสินค้า

export default router;
