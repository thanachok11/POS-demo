import { Request, Response } from "express";
import PurchaseOrder from "../models/PurchaseOrder";
import { verifyToken } from "../utils/auth";
import { generateInvoiceNumber } from "../utils/generateInvoice";

// ✅ สร้าง Purchase Order
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

        const totalAmount = items.reduce(
            (sum: number, item: any) => sum + item.quantity * item.costPrice,
            0
        );

        const po = await PurchaseOrder.create({
            purchaseOrderNumber,
            supplierId,
            supplierCompany,
            location,
            items,
            totalAmount,
            invoiceNumber,
            createdBy: decoded.userId,
        });

        res.status(201).json({ success: true, message: "สร้าง PurchaseOrder สำเร็จ", data: po });
    } catch (error) {
        console.error("Create PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while creating PO" });
    }
};

// ✅ ดึง Purchase Orders ทั้งหมด
export const getPurchaseOrders = async (_: Request, res: Response): Promise<void> => {
    try {
        const orders = await PurchaseOrder.find()
            .populate("supplierId")
            .populate("createdBy")
            .populate("updatedBy")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: "ดึงรายการ PO สำเร็จ", data: orders });
    } catch (error) {
        console.error("Get PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching POs" });
    }
};

// ✅ ดึง PO ตาม id
export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const po = await PurchaseOrder.findById(id)
            .populate("supplierId")
            .populate("createdBy")
            .populate("updatedBy");

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

// ✅ Confirm PO
export const confirmPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
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
            res.status(400).json({ success: false, message: "PO นี้ไม่สามารถยืนยันได้" });
            return;
        }

        if (!po.invoiceNumber) {
            po.invoiceNumber = generateInvoiceNumber();
        }

        po.status = "ได้รับสินค้าแล้ว";
        po.updatedBy = decoded.userId;
        await po.save();

        res.status(200).json({ success: true, message: "ยืนยัน PO สำเร็จ (รอตรวจสอบ QC)", data: po });
    } catch (error) {
        console.error("Confirm PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while confirming PO" });
    }
};

// ✅ Update QC Status
export const updateQCStatus = async (req: Request, res: Response): Promise<void> => {
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
        const { qcStatus } = req.body;

        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        po.qcStatus = qcStatus;
        po.updatedBy = decoded.userId;
        await po.save();

        res.status(200).json({ success: true, message: "อัปเดต QC สำเร็จ", data: po });
    } catch (error) {
        console.error("Update QC Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating QC" });
    }
};

// ✅ Cancel PO
export const cancelPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        if (po.status === "ได้รับสินค้าแล้ว") {
            res.status(400).json({ success: false, message: "ไม่สามารถยกเลิก PO ที่รับสินค้าแล้วได้" });
            return;
        }

        po.status = "ยกเลิก";
        await po.save();

        res.status(200).json({ success: true, message: "ยกเลิก PO สำเร็จ", data: po });
    } catch (error) {
        console.error("Cancel PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while cancelling PO" });
    }
};
