import express from "express";
import { getSuppliers, addSuppliers ,getSupplierById} from "../controllers/supplierController";
import { getProductsAndStockBySupplier } from '../controllers/supplierController';

const router = express.Router();
router.get('/:supplierId',getSupplierById);
router.get('/', getSuppliers);
router.post('/add-suppliers', addSuppliers)
router.get('/:supplierId/products-with-stock', getProductsAndStockBySupplier);

export default router;