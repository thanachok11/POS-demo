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
            .populate("stockLots", "_id batchNumber status qcStatus")

            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: "ดึงรายการ PO สำเร็จ", data: orders });
    } catch (error) {
        console.error("Get PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching POs" });
    }
};

/* ==========================
   📄 ดึงรายละเอียด PO ตาม ID
========================== */
export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const po = await PurchaseOrder.findById(id)
            .populate("supplierId", "companyName phoneNumber email") // ดึงข้อมูล supplier เพิ่มเติม
            .populate("location", "name code") // คลังสินค้า
            .populate("createdBy", "username email role")
            .populate("updatedBy", "username email role")
            .populate("items.productId", "name barcode")
            .populate("items.stockId", "totalQuantity status")
            .populate({
                path: "stockLots", // ✅ เพิ่มส่วนนี้
                populate: [
                    { path: "productId", select: "name barcode" },
                    { path: "stockId", select: "totalQuantity status" },
                    { path: "supplierId", select: "companyName" },
                    { path: "location", select: "name" },
                ],
            });

        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "ดึงข้อมูล PO สำเร็จ ✅",
            data: po,
        });
    } catch (error) {
        console.error("❌ Get PO By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching PO",
        });
    }
};
/* ==========================
   📋 ดึงรายการ PO ทั้งหมด
========================== */
export const getAllPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const purchaseOrders = await PurchaseOrder.find()
            .populate("supplierId", "companyName")
            .populate("location", "name code") // คลังสินค้า
            .populate("stockLots", "_id status qcStatus") // ✅ ดึงเฉพาะ field ที่จำเป็น
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            message: "ดึงรายการใบสั่งซื้อสำเร็จ ✅",
            data: purchaseOrders.map((po) => ({
                _id: po._id,
                purchaseOrderNumber: po.purchaseOrderNumber,
                supplierCompany: po.supplierId?.companyName || "ไม่ระบุ",
                totalLots: po.stockLots?.length || 0, // ✅ เพิ่มนับจำนวนล็อตใน PO
                qcStatus: po.qcStatus || "รอตรวจสอบ",
                status: po.status,
                createdAt: po.createdAt,
            })),
        });
    } catch (error) {
        console.error("❌ Get All PO Error:", error);
        res.status(500).json({
            success: false,
            message: "ไม่สามารถดึงข้อมูลใบสั่งซื้อได้",
            error,
        });
    }
};
/* ========================================================
   🧾 CREATE PURCHASE ORDER
   → ยังไม่สร้าง StockLot (รอ confirm ก่อน)
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

        // ✅ สร้าง items พร้อมยอดรวม (แต่ยังไม่สร้าง lot)
        const itemsWithTotal = items.map((it: any) => ({
            ...it,
            total: Number(it.quantity || 0) * Number(it.costPrice || 0),
        }));

        const totalAmount = itemsWithTotal.reduce((sum: number, it: any) => sum + Number(it.total || 0), 0);

        // ✅ สร้าง PO จริง
        const po = await PurchaseOrder.create({
            purchaseOrderNumber,
            supplierId: supplierDoc._id,
            supplierCompany: supplierCompany ?? supplierDoc.companyName,
            location: warehouseDoc._id,
            items: itemsWithTotal,
            totalAmount,
            invoiceNumber: invoiceNumber || generateInvoiceNumber(),
            createdBy: decoded.userId,
            status: "รอดำเนินการ",
            stockLots: [], // ✅ ยังไม่มีล็อตตอนนี้
        });

        res.status(201).json({
            success: true,
            message: "สร้างใบสั่งซื้อสำเร็จ (ยังไม่สร้างล็อตสินค้า)",
            data: po,
        });
    } catch (error) {
        console.error("❌ Create PO Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating PO",
        });
    }
};

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

        const supplierDoc = await Supplier.findById(po.supplierId).lean<{
            _id: mongoose.Types.ObjectId;
            companyName: string;
            code?: string;
        } | null>();
        const warehouseDoc = await Warehouse.findById(po.location).lean<{
            _id: mongoose.Types.ObjectId;
            name: string;
            code?: string;
        } | null>();

        if (!supplierDoc || !warehouseDoc) {
            res.status(400).json({ success: false, message: "ไม่พบข้อมูล Supplier หรือ Warehouse" });
            return;
        }

        const supplierCode = supplierDoc.code ?? "SP00";
        const warehouseCode = warehouseDoc.code ?? "WH00";

        const stockLotIds: mongoose.Types.ObjectId[] = [];

        // ✅ วนสร้าง StockLot ทีละชิ้น
        for (const raw of po.items) {
            const batchNumber =
                raw.batchNumber && String(raw.batchNumber).trim() !== ""
                    ? String(raw.batchNumber).trim()
                    : await generateBatchNumber(warehouseCode, supplierCode, raw.productId.toString());

            const productDoc = await Product.findById(raw.productId)
                .select("barcode name")
                .lean<{ _id: mongoose.Types.ObjectId; barcode: string; name: string } | null>();

            if (!productDoc) {
                console.warn(`⚠️ ไม่พบสินค้า ID: ${raw.productId}`);
                continue;
            }

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
                    barcode: productDoc.barcode,
                    totalQuantity: 0,
                    threshold: raw.threshold ?? 5,
                    status: "สินค้าพร้อมขาย",
                    isActive: true,
                });
            }

            // ✅ สร้าง StockLot (รอตรวจสอบ QC)
            const stockLot = await StockLot.create({
                stockId: stock._id,
                productId: raw.productId,
                supplierId: supplierDoc._id,
                supplierName: supplierDoc.companyName,
                userId: decoded.userId,
                location: warehouseDoc._id,
                purchaseOrderNumber: po.purchaseOrderNumber,
                barcode: productDoc.barcode,
                batchNumber,
                expiryDate: raw.expiryDate,
                quantity: raw.quantity,
                costPrice: raw.costPrice,
                salePrice: raw.salePrice ?? raw.costPrice,
                status: "รอตรวจสอบ QC",
                isActive: false,
                isTemporary: true,
                purchaseOrderId: po._id,
            });

            // ✅ update item ใน PO ให้มี batchNumber ด้วย
            raw.batchNumber = batchNumber;
            stockLotIds.push(stockLot._id);
        }

        // ✅ update PO
        po.status = "ได้รับสินค้าแล้ว";
        po.qcStatus = "รอตรวจสอบ";
        po.stockLots = stockLotIds;
        po.receivedAt = new Date();
        po.updatedBy = (decoded as any).userId;
        po.markModified("items"); // ✅ แจ้ง mongoose ว่า items เปลี่ยนแล้ว

        await po.save();

        res.status(200).json({
            success: true,
            message: "✅ ยืนยันใบสั่งซื้อสำเร็จ (สร้างล็อตและ batchNumber แล้ว)",
            data: po,
        });
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

        if (po.status !== "ไม่ผ่าน QC - รอส่งคืนสินค้า") {
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
