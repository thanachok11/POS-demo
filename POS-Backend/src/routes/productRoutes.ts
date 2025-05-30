import express from "express";
import {getProducts,getAllProducts,getProductByBarcode,getProductsByCategory} from "../controllers/productController";
const router = express.Router();
router.get('/', getAllProducts);
router.get('/get',getProducts)
router.get('/:barcode', getProductByBarcode);
router.get('/category/:category', getProductsByCategory);
export default router;