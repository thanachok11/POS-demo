import express from "express";
import {
    getSuppliers, addSupplier, getSupplierById, updateSupplier,
    deleteSupplier,
} from "../controllers/supplierController";
import { getProductsAndStockBySupplier } from '../controllers/supplierController';

const router = express.Router();
router.get('/', getSuppliers);
router.get('/:supplierId/products-with-stock', getProductsAndStockBySupplier);
router.post("/create", addSupplier);
router.get("/", getSuppliers);
router.get("/:supplierId", getSupplierById);
router.patch("/:supplierId", updateSupplier);
router.delete("/:supplierId", deleteSupplier);

export default router;