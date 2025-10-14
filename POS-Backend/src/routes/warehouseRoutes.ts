import express from "express";
import {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
} from "../controllers/warehouseController";

const router = express.Router();

router.post("/create", createWarehouse); // สร้างคลังสินค้า
router.get("/", getWarehouses); // ดูคลังทั้งหมด
router.get("/:id", getWarehouseById); // ดูคลังจาก id
router.patch("/:id", updateWarehouse); // แก้ไข
router.delete("/:id", deleteWarehouse); // ลบ

export default router;

