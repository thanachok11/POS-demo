import express from 'express';
import {getStocks,getStockByBarcode} from '../controllers/stockController';
const router = express.Router();

router.get('/',getStocks);
router.get('/:barcode',getStockByBarcode)
export default router;
