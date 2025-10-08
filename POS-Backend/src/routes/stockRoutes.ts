import express from "express";
import {
    getStocks,
    getStockByBarcode,
    updateStock,
    returnProductByBarcode,
    deleteStockByBarcode,
} from "../controllers/stockController";

const router = express.Router();

router.get("/", getStocks);
router.get("/:barcode", getStockByBarcode);
router.patch("/:barcode", updateStock);

router.delete("/:barcode", deleteStockByBarcode);

export default router;

