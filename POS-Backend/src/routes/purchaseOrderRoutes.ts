import express from "express";
import {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    confirmPurchaseOrder,
    cancelPurchaseOrder,
} from "../controllers/purchaseOrderController";

const router = express.Router();
router.post("/", createPurchaseOrder);
router.get("/", getPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.post("/:id/confirm", confirmPurchaseOrder);
router.post("/:id/cancel", cancelPurchaseOrder);

export default router;
