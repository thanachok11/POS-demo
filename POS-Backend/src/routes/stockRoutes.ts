import express from 'express';
import { getStocks, getStockByBarcode, updateStockByBarcode, updateQuantityByBarcode } from '../controllers/stockController';
const router = express.Router();

router.get('/',getStocks);
router.get('/:barcode',getStockByBarcode)
router.put('/:barcode', updateQuantityByBarcode)

export default router;
