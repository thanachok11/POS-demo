import express from "express";
import {
    getSuppliers, addSupplier, getSupplierById, updateSupplier,
    deleteSupplier,
} from "../controllers/supplierController";
import { getProductsAndStockBySupplier } from '../controllers/supplierController';

const router = express.Router();
router.get('/:supplierId',getSupplierById);
router.get('/', getSuppliers);
router.post('/add-suppliers', addSupplier)
router.get('/:supplierId/products-with-stock', getProductsAndStockBySupplier);
router.put("/:supplierId", updateSupplier);
router.patch("/:supplierId", updateSupplier);
router.delete("/:supplierId", deleteSupplier);

export default router;