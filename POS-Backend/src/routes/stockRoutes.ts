import express from "express";
import {
    getStocks,
    getStockByBarcode,
    updateStock,
    returnProductByBarcode,
    deleteStockByBarcode,
} from "../controllers/stockController";
import { getStockByProductId } from "../controllers/stockController";

const router = express.Router();

router.get("/", getStocks);
router.get("/by-product/:productId", getStockByProductId);

router.get("/:barcode", getStockByBarcode);
router.patch("/:barcode", updateStock);

router.delete("/:barcode", deleteStockByBarcode);

export default router;

