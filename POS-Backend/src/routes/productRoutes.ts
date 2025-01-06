import express from "express";
import {getAllProducts,getProductByBarcode} from "../controllers/productController";
const router = express.Router();
router.get('/', getAllProducts);
router.get('/:barcode', getProductByBarcode);
export default router;