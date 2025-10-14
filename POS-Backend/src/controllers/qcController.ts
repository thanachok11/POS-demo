import { Request, Response } from "express";
import mongoose from "mongoose";
import QC from "../models/QualityControl";
import Product from "../models/Product";
import Stock from "../models/Stock";
import StockLot from "../models/StockLot";
import Supplier from "../models/Supplier";
import Warehouse from "../models/Warehouse";
import PurchaseOrder from "../models/PurchaseOrder";
import StockTransaction from "../models/StockTransaction";
import cloudinary from "../utils/cloudinary";
import { verifyToken } from "../utils/auth";
import { updateStockTotalFromLots } from "../utils/qcHelpers";

/* =========================================================
   Helpers
========================================================= */
function getUserIdFromReq(req: Request): string | null {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !("userId" in decoded)) return null;
    return decoded.userId as string;
}

/* =========================================================
   ✅ CREATE QC RECORD (รองรับแนบรูป)
   ❗️ตอนนี้จะไม่ไปอัปเดต stock หรือ transaction แล้ว
========================================================= */
export const createQCRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromReq(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const {
            batchNumber,
            productId,
            supplierId,
            warehouseId,
            temperature,
            humidity,
            status,
            issues,
            remarks,
        } = req.body;

        if (!batchNumber || !productId || !supplierId || !warehouseId) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }

        const [product, supplier, warehouse] = await Promise.all([
            Product.findById(productId),
            Supplier.findById(supplierId),
            Warehouse.findById(warehouseId),
        ]);
        if (!product || !supplier || !warehouse) {
            res.status(404).json({ success: false, message: "Product / Supplier / Warehouse not found" });
            return;
        }

        const lot = await StockLot.findOne({ batchNumber });
        if (!lot) {
            res.status(404).json({ success: false, message: "ไม่พบล็อตสินค้าที่ตรงกับ batchNumber" });
            return;
        }

        // ✅ Upload ไฟล์แนบ (ถ้ามี)
        let attachments: { url: string; public_id: string }[] = [];
        if (req.files && Object.keys(req.files).length > 0) {
            const list = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            for (const file of list as any[]) {
                const result = await cloudinary.uploader.upload(file.path, { folder: "qc" });
                attachments.push({ url: result.secure_url, public_id: result.public_id });
            }
        }

        // ✅ บันทึกผล QC record
        const qcRecord = await QC.create({
            batchNumber,
            productId,
            supplierId,
            warehouseId,
            userId,
            temperature,
            humidity,
            status: status || "รอตรวจ",
            issues: issues || [],
            remarks,
            attachments,
        });

        // ✅ แค่บันทึกผลในล็อตเฉย ๆ (ไม่แตะ stock)
        lot.qcStatus = status || "รอตรวจสอบ";
        lot.status = "รอตรวจสอบ QC";
        await lot.save();

        res.status(201).json({
            success: true,
            message: "✅ บันทึกข้อมูลการตรวจสอบคุณภาพสำเร็จ",
            data: qcRecord,
        });
    } catch (error) {
        console.error("❌ createQCRecord Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================================================
   ✅ ดึงข้อมูล QC ตาม batchNumber
========================================================= */
export const getQCByBatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { batchNumber } = req.params;
        const qcRecord = await QC.find({ batchNumber })
            .populate("productId", "name barcode")
            .populate("supplierId", "companyName code")
            .populate("warehouseId", "name location")
            .populate("userId", "username email");

        if (!qcRecord || qcRecord.length === 0) {
            res.status(404).json({ success: false, message: "ไม่พบข้อมูล QC สำหรับล็อตนี้" });
            return;
        }

        res.status(200).json({ success: true, data: qcRecord });
    } catch (error) {
        console.error("❌ getQCByBatch Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================================================
   ✅ UPDATE QC RECORD (แค่บันทึกผลล็อตเดียว)
========================================================= */
export const updateQCRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const userId = getUserIdFromReq(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const qcRecord = await QC.findById(id);
        if (!qcRecord) {
            res.status(404).json({ success: false, message: "QC Record not found" });
            return;
        }

        const lot = await StockLot.findOne({ batchNumber: qcRecord.batchNumber });
        if (!lot) {
            res.status(404).json({ success: false, message: "ไม่พบล็อตสินค้า" });
            return;
        }

        // ✅ บันทึกผลเฉพาะ QC
        qcRecord.status = status || qcRecord.status;
        qcRecord.remarks = remarks || qcRecord.remarks;
        await qcRecord.save();

        // ✅ แค่ sync สถานะในล็อต (ไม่แตะสต็อก)
        lot.qcStatus = status || "รอตรวจสอบ";
        await lot.save();

        res.status(200).json({
            success: true,
            message: `✅ บันทึกผล QC ล็อต ${lot.batchNumber} สำเร็จ`,
            data: qcRecord,
        });
    } catch (error) {
        console.error("❌ updateQCRecord Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating QC record" });
    }
};

/* =========================================================
   🧪 UPDATE QC STATUS (สรุป QC ทั้งใบ + เติมสต็อกเฉพาะสินค้าที่ผ่าน)
========================================================= */
export const updateQCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // PO ID
        const qcStatus = req.body.qcStatus || req.body.status;

        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        const userId = (decoded as any).userId;
        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบใบสั่งซื้อ" });
            return;
        }

        // 🧩 ป้องกันการทำซ้ำ
        if (po.status === "QC ผ่าน") {
            res.status(400).json({
                success: false,
                message: "ใบสั่งซื้อนี้ผ่าน QC แล้ว ไม่สามารถดำเนินการซ้ำได้",
            });
            return;
        }

        po.updatedBy = userId;

        /* =========================================================
           ✅ เติมสต็อกเฉพาะสินค้าที่ผ่าน QC
        ========================================================= */
        let passedCount = 0;
        let failedCount = 0;
        const totalCount = (po.items || []).length;

        for (const item of po.items as any[]) {
            const lot = await StockLot.findOne({ batchNumber: item.batchNumber });
            if (!lot) continue;

            if (lot.qcStatus === "ผ่าน") {
                // ✅ ป้องกันการทำซ้ำ
                const existingTxn = await StockTransaction.findOne({
                    stockLotId: lot._id,
                    type: "RESTOCK",
                    notes: { $regex: "QC ผ่าน", $options: "i" },
                });
                if (existingTxn) {
                    passedCount++;
                    item.qcStatus = "ผ่าน";
                    continue;
                }

                // ✅ อัปเดตล็อตและเติมสต็อก
                lot.status = "สินค้าพร้อมขาย";
                lot.isActive = true;
                lot.isTemporary = false;
                lot.lastRestocked = new Date();
                await lot.save();

                await Stock.updateOne(
                    { _id: lot.stockId },
                    { $inc: { totalQuantity: lot.quantity }, $set: { lastRestocked: new Date() } }
                );

                await StockTransaction.create({
                    stockId: lot.stockId,
                    productId: lot.productId,
                    stockLotId: lot._id,
                    type: "RESTOCK",
                    quantity: lot.quantity,
                    costPrice: lot.costPrice,
                    userId,
                    notes: `QC ผ่าน | PO ${po.purchaseOrderNumber} | Batch ${lot.batchNumber}`,
                });

                await updateStockTotalFromLots(lot.stockId.toString());
                passedCount++;
                item.qcStatus = "ผ่าน";
            } else if (lot.qcStatus === "ไม่ผ่าน") {
                lot.status = "รอคัดออก";
                lot.isActive = false;
                lot.isTemporary = true;
                await lot.save();
                failedCount++;
                item.qcStatus = "ไม่ผ่าน";
            } else {
                // ยังไม่ได้ตรวจ
                item.qcStatus = "รอตรวจ";
            }
        }

        /* =========================================================
           📊 คำนวณสถานะรวมของ PO
        ========================================================= */
        let newQCStatus = "รอตรวจ";
        if (passedCount === totalCount) newQCStatus = "ผ่าน";
        else if (failedCount === totalCount) newQCStatus = "ไม่ผ่าน";
        else if (passedCount > 0 && failedCount > 0) newQCStatus = "ผ่านบางส่วน";
        else if (passedCount > 0 || failedCount > 0) newQCStatus = "ตรวจบางส่วน";

        po.qcStatus = newQCStatus;

        // 🧭 สถานะใบ PO
        if (passedCount === totalCount) {
            po.status = "QC ผ่าน";
        } else if (failedCount === totalCount) {
            po.status = "ไม่ผ่าน QC - รอส่งคืนสินค้า";
        } else if (passedCount > 0 && failedCount > 0) {
            po.status = "QC ผ่านบางส่วน";
        } else if (passedCount > 0 || failedCount > 0) {
            po.status = "ตรวจบางส่วน";
        }

        po.qcCheckedAt = new Date();
        await po.save();

        res.status(200).json({
            success: true,
            message: `✅ สรุป QC สำเร็จ (${passedCount} ผ่าน / ${failedCount} ไม่ผ่าน)`,
            data: po,
        });
    } catch (error) {
        console.error("❌ Update QC Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating QC" });
    }
};


/**
 * ✅ ลบข้อมูล QC
 * (หมายเหตุ: การลบ QC จะไม่ย้อนสถานะ LOT/Stock อัตโนมัติ เพื่อความปลอดภัยด้านข้อมูล)
 */
export const deleteQCRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const qcRecord = await QC.findByIdAndDelete(id);
        if (!qcRecord) {
            res.status(404).json({ success: false, message: "ไม่พบข้อมูล QC" });
            return;
        }
        res.status(200).json({ success: true, message: "🗑️ ลบข้อมูล QC เรียบร้อย" });
    } catch (error) {
        console.error("❌ deleteQCRecord Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
