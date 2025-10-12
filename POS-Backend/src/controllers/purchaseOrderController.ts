import { Request, Response } from "express";
import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder";
import { verifyToken } from "../utils/auth";
import { generateInvoiceNumber } from "../utils/generateInvoice";
import { generateBatchNumber } from "../utils/generateBatch";

import Stock from "../models/Stock";
import StockLot from "../models/StockLot";
import Supplier from "../models/Supplier";
import Warehouse from "../models/Warehouse";
import Product from "../models/Product";
import StockTransaction from "../models/StockTransaction";

/* ========================================================
   🔧 Helper: หา document จาก id หรือชื่อ
======================================================== */
async function ensureObjectIdOrByName(model: any, value: any, nameField: string) {
    if (!value) return null;
    if (mongoose.Types.ObjectId.isValid(value)) {
        return await model.findById(value).lean();
    }
    return await model.findOne({ [nameField]: value }).lean();
}

/* ==========================
   ดึงรายการ Purchase Orders ทั้งหมด
========================== */
export const getPurchaseOrders = async (_: Request, res: Response): Promise<void> => {
    try {
        const orders = await PurchaseOrder.find()
            .populate("supplierId")
            .populate("location") // คลัง
            .populate("createdBy")
            .populate("updatedBy")
            .populate("items.productId", "name barcode")
            .populate("items.stockId")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: "ดึงรายการ PO สำเร็จ", data: orders });
    } catch (error) {
        console.error("Get PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching POs" });
    }
};

/* ==========================
   ดึงรายละเอียด PO ตาม ID
========================== */
export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const po = await PurchaseOrder.findById(id)
            .populate("supplierId")
            .populate("location")
            .populate("createdBy")
            .populate("updatedBy")
            .populate("items.productId", "name barcode")
            .populate("items.stockId");

        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        res.status(200).json({ success: true, message: "ดึงข้อมูล PO สำเร็จ", data: po });
    } catch (error) {
        console.error("Get PO By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching PO" });
    }
};


/* ========================================================
   🧾 CREATE PURCHASE ORDER
   → สร้าง StockLot จริง (รอตรวจสอบ QC)
======================================================== */
export const createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized, no token" });
            return;
        }

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        const { purchaseOrderNumber, supplierId, supplierCompany, location, items, invoiceNumber } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ success: false, message: "Items are required" });
            return;
        }

        // 🔍 หา Supplier / Warehouse
        const supplierDoc = await ensureObjectIdOrByName(Supplier, supplierId, "companyName");
        if (!supplierDoc) {
            res.status(400).json({ success: false, message: "ไม่พบ Supplier" });
            return;
        }

        const warehouseDoc =
            (await ensureObjectIdOrByName(Warehouse, location, "name")) ||
            (await Warehouse.findOne({ name: location }).lean());
        if (!warehouseDoc) {
            res.status(400).json({ success: false, message: "ไม่พบคลังสินค้า" });
            return;
        }

        const supplierCode = (supplierDoc as any)?.code ?? "SP00";
        const warehouseCode = (warehouseDoc as any)?.code ?? "WH00";

        const itemsWithLot: any[] = [];

        for (const raw of items) {
            const batchNumber =
                raw.batchNumber && String(raw.batchNumber).trim() !== ""
                    ? String(raw.batchNumber).trim()
                    : await generateBatchNumber(
                        warehouseCode,
                        supplierCode,
                        raw.productId.toString() // ✅ เพิ่ม productId
                    );


            const productDoc = await Product.findById(raw.productId)
                .select("barcode name")
                .lean<{ _id: mongoose.Types.ObjectId; barcode: string; name: string }>();
            if (!productDoc) {
                res.status(400).json({ success: false, message: `ไม่พบสินค้า ID: ${raw.productId}` });
                return;
            }

            // ✅ ตรวจว่ามี Stock หลักหรือยัง
            let stock = await Stock.findOne({
                productId: raw.productId,
                location: warehouseDoc._id,
            });
            if (!stock) {
                stock = await Stock.create({
                    productId: raw.productId,
                    userId: decoded.userId,
                    supplierId: supplierDoc._id,
                    supplierName: supplierDoc.companyName,
                    location: warehouseDoc._id,
                    totalQuantity: 0,
                    threshold: raw.threshold ?? 5,
                    status: "สินค้าพร้อมขาย",
                    isActive: true,
                });
            }

            // ✅ สร้าง StockLot จริง
            const stockLot = await StockLot.create({
                stockId: stock._id,
                productId: raw.productId,
                supplierId: supplierDoc._id,
                supplierName: supplierDoc.companyName,
                userId: decoded.userId,
                location: warehouseDoc._id,
                batchNumber,
                expiryDate: raw.expiryDate,
                barcode: productDoc.barcode,
                quantity: 0,
                costPrice: raw.costPrice,
                salePrice: raw.salePrice ?? raw.costPrice,
                status: "รอตรวจสอบ QC",
                isActive: false,
                isTemporary: true,
            });

            itemsWithLot.push({
                ...raw,
                stockId: stock._id,
                stockLotId: stockLot._id,
                barcode: productDoc.barcode,
                batchNumber,
                total: Number(raw.quantity || 0) * Number(raw.costPrice || 0),
            });
        }

        const totalAmount = itemsWithLot.reduce((sum: number, it: any) => sum + Number(it.total || 0), 0);

        const po = await PurchaseOrder.create({
            purchaseOrderNumber,
            supplierId: supplierDoc._id,
            supplierCompany: supplierCompany ?? supplierDoc.companyName,
            location: warehouseDoc._id,
            items: itemsWithLot,
            totalAmount,
            invoiceNumber: invoiceNumber || generateInvoiceNumber(),
            createdBy: decoded.userId,
            status: "รอดำเนินการ",
        });

        res.status(201).json({ success: true, message: "สร้างใบสั่งซื้อสำเร็จ ✅", data: po });
    } catch (error) {
        console.error("❌ Create PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while creating PO" });
    }
};

/* ========================================================
   📦 CONFIRM PURCHASE ORDER
   → อัปเดต StockLot ทั้งหมดเป็น "รอ QC"
======================================================== */
export const confirmPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
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

        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบใบสั่งซื้อ" });
            return;
        }

        if (po.status !== "รอดำเนินการ") {
            res.status(400).json({ success: false, message: "PO นี้ถูกยืนยันแล้ว" });
            return;
        }

        await StockLot.updateMany(
            { _id: { $in: po.items.map((x: any) => x.stockLotId) } },
            { $set: { status: "รอตรวจสอบ QC", qcStatus: "รอตรวจสอบ", isActive: false } }
        );

        po.status = "ได้รับสินค้าแล้ว";
        po.receivedAt = new Date();
        po.updatedBy = (decoded as any).userId;
        await po.save();

        res.status(200).json({ success: true, message: "ยืนยันใบสั่งซื้อสำเร็จ (รอ QC)", data: po });
    } catch (error) {
        console.error("❌ Confirm PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while confirming PO" });
    }
};



/* ========================================================
   🔁 RETURN PURCHASE ORDER
   → สำหรับกรณี QC ไม่ผ่าน
======================================================== */
export const returnPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
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

        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        if (po.status !== "ไม่ผ่าน QC - รอคืนสินค้า") {
            res.status(400).json({ success: false, message: "PO นี้ไม่สามารถคืนสินค้าได้" });
            return;
        }

        for (const item of po.items as any[]) {
            const lot = await StockLot.findById(item.stockLotId);
            if (!lot) continue;

            lot.status = "รอคัดออก";
            lot.isActive = false;
            lot.isTemporary = true;
            await lot.save();

            await StockTransaction.create({
                stockId: lot.stockId,
                productId: lot.productId,
                stockLotId: lot._id,
                type: "RETURN",
                quantity: item.quantity,
                costPrice: item.costPrice,
                userId: decoded.userId,
                notes: `คืนสินค้า | PO ${po.purchaseOrderNumber} | Batch ${lot.batchNumber}`,
            });
        }

        po.status = "ไม่ผ่าน QC - คืนสินค้าแล้ว";
        po.returnedAt = new Date();
        po.updatedBy = (decoded as any).userId;
        await po.save();

        res.status(200).json({ success: true, message: "คืนสินค้าเรียบร้อย ✅", data: po });
    } catch (error) {
        console.error("❌ Return PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while returning PO" });
    }
};

/* ========================================================
   ❌ CANCEL PURCHASE ORDER
======================================================== */
export const cancelPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized, no token" });
            return;
        }

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        const { id } = req.params;
        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        if (po.status !== "รอดำเนินการ") {
            res.status(400).json({
                success: false,
                message: "ไม่สามารถยกเลิก PO ที่ได้รับสินค้าแล้วหรืออยู่ในขั้นตอน QC ได้",
            });
            return;
        }

        po.status = "ยกเลิก";
        po.updatedBy = (decoded as any).userId;
        await po.save();

        // ลบ StockLot ทั้งหมดที่สร้างจาก PO นี้
        await StockLot.deleteMany({ _id: { $in: po.items.map((x: any) => x.stockLotId) } });

        res.status(200).json({ success: true, message: "ยกเลิก PO สำเร็จ ✅", data: po });
    } catch (error) {
        console.error("❌ Cancel PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while cancelling PO" });
    }
};
