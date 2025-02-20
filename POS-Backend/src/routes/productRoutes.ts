import express from "express";
import {getProducts,getAllProducts,getProductByBarcode} from "../controllers/productController";
import {addProduct} from "../controllers/productController";
const router = express.Router();
router.get('/', getAllProducts);
router.get('/get',getProducts)
router.post('/add',addProduct)
router.get('/:barcode', getProductByBarcode);
export default router;