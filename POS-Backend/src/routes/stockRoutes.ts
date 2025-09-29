import express from 'express';
import { getStocks, 
    getStockByBarcode, 
    updateStockByBarcode, 
    updateQuantityByBarcode,
    updateStock,
    deleteStockByBarcode

} from '../controllers/stockController';
const router = express.Router();

router.get('/',getStocks);
router.get('/:barcode',getStockByBarcode)
router.put('/:barcode', updateQuantityByBarcode)
router.patch('/:barcode', updateStockByBarcode)
router.put('/barcode/:barcode', updateStock)
router.patch('/barcode/:barcode', updateStock)
router.delete('/barcode/:barcode', deleteStockByBarcode);

export default router;
