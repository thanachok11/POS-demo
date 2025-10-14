import express from "express";
import {
    createQCRecord,
    getQCByBatch,
    updateQCRecord, // ✅ เพิ่ม function สำหรับอัปเดต QC Record รายล็อต
    updateQCStatus, // ✅ ยังใช้สำหรับอัปเดต QC ของทั้ง PO ได้
    deleteQCRecord,
} from "../controllers/qcController";
import upload from "../middlewares/uploadMiddleware";

const router = express.Router();

/* =========================================================
   ✅ CREATE QC RECORD (รองรับแนบหลายรูป)
   → ใช้ตอนสร้างใบ QC ครั้งแรก (สินค้าเพิ่งเข้าคลัง)
========================================================= */
router.post("/", upload.array("attachments", 10), createQCRecord);

/* =========================================================
   ✅ GET QC BY BATCH NUMBER
   → ดึงข้อมูล QC ทั้งหมดของล็อตนั้น
========================================================= */
router.get("/:batchNumber", getQCByBatch);

/* =========================================================
   ✅ UPDATE QC RECORD (รายล็อต)
   → ใช้ตอนเจ้าหน้าที่ QC ตรวจแล้วบันทึกผล "ผ่าน" / "ไม่ผ่าน"
========================================================= */
router.put("/:id", updateQCRecord);

/* =========================================================
   ✅ UPDATE QC STATUS (ของทั้งใบ PO)
   → ใช้ตอนสรุปผล QC ทั้งใบ (optional)
========================================================= */
router.patch("/update/:id", updateQCStatus);

/* =========================================================
   ✅ DELETE QC RECORD
   → ลบเอกสาร QC ออกจากระบบ (ไม่ revert lot)
========================================================= */
router.delete("/:id", deleteQCRecord);

export default router;
