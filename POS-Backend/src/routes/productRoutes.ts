import { Router } from "express";
import {
    getProductByBarcode,
    getProducts,
    getAllProducts,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
} from "../controllers/productController";

const router = Router();

// 📦 Product Routes
router.get('/get', getProducts)
router.get('/:barcode', getProductByBarcode);

router.get("/all", getAllProducts);        // ✅ ทุก product
router.get("/category/:category", getProductsByCategory);
router.put("/:id", updateProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);



export default router;
