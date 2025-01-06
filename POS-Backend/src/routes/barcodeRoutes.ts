import express from "express";
import { getProductByBarcode } from "../controllers/productController";


const router = express.Router();
router.get('/:barcode', getProductByBarcode);
export default router;