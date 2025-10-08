import express from "express";
import {
    createDiscount,
    getDiscounts,
    deleteDiscount,
    validateDiscount,
    updateDiscount, // ✅ import ตัวใหม่
} from "../controllers/discountController";

const router = express.Router();

router.post("/", createDiscount);
router.get("/", getDiscounts);
router.delete("/:id", deleteDiscount);
router.post("/validate", validateDiscount);
router.patch("/:id", updateDiscount); // ✅ เพิ่ม endpoint แก้ไข

export default router;
