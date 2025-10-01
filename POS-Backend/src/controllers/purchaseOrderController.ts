import { Request, Response } from "express";
import PurchaseOrder from "../models/PurchaseOrder";
import Stock from "../models/Stock";
import StockTransaction from "../models/StockTransaction";
import { verifyToken } from "../utils/auth";
import { generateInvoiceNumber } from "../utils/generateInvoice";

// สร้าง Purchase Order
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

        // คำนวณยอดรวม
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

// ดึง Purchase Orders ทั้งหมด
export const getPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await PurchaseOrder.find()
            .populate("supplierId")
            .populate("createdBy")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Get PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching POs" });
    }
};

// ดึง PO ตาม id
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

        res.status(200).json({ success: true, data: po });
    } catch (error) {
        console.error("Get PO By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching PO" });
    }
};

// Confirm PO (รับสินค้าเข้าคลัง → update stock + log transaction)
export const confirmPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // user ที่กด confirm

        const po = await PurchaseOrder.findById(id);
        if (!po) {
            res.status(404).json({ success: false, message: "ไม่พบ PurchaseOrder" });
            return;
        }

        if (po.status === "ได้รับสินค้าแล้ว") {
            res.status(400).json({ success: false, message: "PO นี้ถูกยืนยันไปแล้ว" });
            return;
        }
        // สร้าง invoiceNumber อัตโนมัติถ้าไม่มี
        if (!po.invoiceNumber) {
            po.invoiceNumber = generateInvoiceNumber();
        }
        // loop items เพื่อ update stock
        for (const item of po.items) {
            let stock = await Stock.findOne({ productId: item.productId, location: po.location });

            if (stock) {
                // ถ้ามี stock เดิม → update
                stock.quantity += item.quantity;
                stock.lastPurchasePrice = item.costPrice;
                stock.costPrice = item.costPrice;
                stock.lastRestocked = new Date();
                stock.batchNumber = item.batchNumber; // เพิ่ม batch number
                stock.expiryDate = item.expiryDate;   // เพิ่ม expiry date
                await stock.updateStatus();
                await stock.save();
            } else {
                // ถ้ายังไม่มี stock → สร้างใหม่
                stock = await Stock.create({
                    productId: item.productId,
                    userId, // ผูกกับ admin/user ที่รับเข้า
                    supplierId: po.supplierId,
                    supplierName: po.supplierCompany,
                    quantity: item.quantity,
                    costPrice: item.costPrice,
                    salePrice: item.costPrice * 1.2, // markup auto 20% (ตัวอย่าง)
                    location: po.location,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                    lastRestocked: new Date(),
                });
            }

            // สร้าง StockTransaction log
            await StockTransaction.create({
                stockId: stock._id,
                productId: item.productId,
                type: "RESTOCK",
                quantity: item.quantity,
                referenceId: po._id,
                userId,
                costPrice: item.costPrice,
                notes: `นำเข้าสินค้าจาก PO ${po.purchaseOrderNumber}, Batch: ${item.batchNumber || "N/A"}`,
                source: "SUPPLIER"
            });
        }

        po.status = "ได้รับสินค้าแล้ว";
        await po.save();

        res.status(200).json({ success: true, message: "ยืนยันรับสินค้าแล้ว", data: po });
    } catch (error) {
        console.error("Confirm PO Error:", error);
        res.status(500).json({ success: false, message: "Server error while confirming PO" });
    }
};

// ยกเลิก PO
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
