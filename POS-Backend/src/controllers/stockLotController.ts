import { Request, Response } from "express";
import StockLot from "../models/StockLot";
import Product from "../models/Product";
import User from "../models/User";
import Employee from "../models/Employee";
import { verifyToken } from "../utils/auth";


//หาค่า ownerId จาก userId (รองรับ admin / employee)
const getOwnerId = async (userId: string): Promise<string> => {
    let user = await User.findById(userId);
    if (!user) {
        user = await Employee.findById(userId);
    }
    if (!user) throw new Error("User not found");

    if (user.role === "admin") {
        return user._id.toString();
    } else if (user.role === "employee") {
        if (!user.adminId) throw new Error("Employee does not have admin assigned");
        return user.adminId.toString();
    } else {
        throw new Error("Invalid user role");
    }
};

/* ===================================================
   📦 ดึงข้อมูล StockLot ทั้งหมดของ user (owner)
=================================================== */
export const getStockLots = async (req: Request, res: Response): Promise<void> => {
    try {
        // ✅ ตรวจสอบ token
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized, no token provided" });
            return;
        }

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        const ownerId = await getOwnerId(decoded.userId);

        // ✅ ดึงข้อมูลล็อตทั้งหมดของ owner
        const stockLots = await StockLot.find({ userId: ownerId })
            .populate({
                path: "productId",
                populate: { path: "category" },
            })
            .populate("supplierId")
            .populate("location")
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: stockLots });
    } catch (error) {
        console.error("Get StockLots Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching stock lots" });
    }
};

/* ===================================================
   🔎 กรองล็อตสินค้า
=================================================== */
export const filterStockLots = async (req: Request, res: Response): Promise<void> => {
    try {
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

        const ownerId = await getOwnerId(decoded.userId);
        const { status, qcStatus, warehouseId, supplierId } = req.query;

        const filter: any = { userId: ownerId };
        if (status) filter.status = status;
        if (qcStatus) filter.qcStatus = qcStatus;
        if (warehouseId) filter.location = warehouseId;
        if (supplierId) filter.supplierId = supplierId;

        const stockLots = await StockLot.find(filter)
            .populate("productId")
            .populate("supplierId", "name")
            .populate("location", "name")
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: stockLots });
    } catch (error) {
        console.error("Filter StockLot Error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการกรองล็อตสินค้า" });
    }
};


/* ===================================================
   🔍 ค้นหา StockLot ด้วย Barcode (สินค้าเดียว)
=================================================== */
export const getStockLotsByBarcode = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized, no token provided" });
            return;
        }

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        const ownerId = await getOwnerId(decoded.userId);
        const { barcode } = req.params;

        // ✅ หา product จาก barcode
        const product = await Product.findOne({ barcode });
        if (!product) {
            res.status(404).json({ success: false, message: "ไม่พบสินค้าในระบบ" });
            return;
        }

        // ✅ ดึงล็อตทั้งหมดของสินค้านี้ (เฉพาะของ owner นี้)
        const stockLots = await StockLot.find({
            productId: product._id,
            userId: ownerId,
        })
            .populate("supplierId", "name")
            .populate("location", "name")
            .sort({ createdAt: -1 });

        const totalQuantity = stockLots.reduce((sum, lot) => sum + lot.quantity, 0);

        res.status(200).json({
            success: true,
            product: {
                _id: product._id,
                name: product.name,
                barcode: product.barcode,
                imageUrl: product.imageUrl,
                salePrice: product.salePrice,
                costPrice: product.costPrice,
            },
            totalLots: stockLots.length,
            totalQuantity,
            lots: stockLots,
        });
    } catch (error) {
        console.error("Get StockLotsByBarcode Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching stock lots by barcode" });
    }
};

/* ===================================================
   🗓️ อัปเดตวันหมดอายุของล็อต
=================================================== */
export const updateExpiryDate = async (req: Request, res: Response): Promise<void> => {
    try {
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

        const { lotId } = req.params;
        const { expiryDate } = req.body;

        const updated = await StockLot.findByIdAndUpdate(
            lotId,
            { expiryDate },
            { new: true }
        );

        if (!updated) {
            res.status(404).json({ success: false, message: "ไม่พบล็อตสินค้าที่ต้องการอัปเดต" });
            return;
        }

        res.status(200).json({ success: true, message: "อัปเดตวันหมดอายุสำเร็จ", data: updated });
    } catch (error) {
        console.error("Update Expiry Date Error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตวันหมดอายุ" });
    }
};

/* ===================================================
   🧪 อัปเดตสถานะ QC ของล็อตสินค้า
=================================================== */
export const updateQCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
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

        const { lotId } = req.params;
        const { qcStatus, notes } = req.body;

        const updated = await StockLot.findByIdAndUpdate(
            lotId,
            { qcStatus, notes },
            { new: true }
        );

        if (!updated) {
            res.status(404).json({ success: false, message: "ไม่พบล็อตสินค้า" });
            return;
        }

        res.status(200).json({
            success: true,
            message: `อัปเดตสถานะ QC เป็น "${qcStatus}" สำเร็จ`,
            data: updated,
        });
    } catch (error) {
        console.error("Update QC Error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ QC" });
    }
};

/* ===================================================
   🚫 ปิดล็อต (Inactive / หมดอายุ)
=================================================== */
export const deactivateStockLot = async (req: Request, res: Response): Promise<void> => {
    try {
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

        const { lotId } = req.params;

        const lot = await StockLot.findById(lotId);
        if (!lot) {
            res.status(404).json({ success: false, message: "ไม่พบล็อตสินค้าที่ต้องการปิด" });
            return;
        }

        lot.isActive = false;
        lot.status = "รอคัดออก";
        await lot.save();

        res.status(200).json({ success: true, message: "ปิดล็อตสำเร็จ", data: lot });
    } catch (error) {
        console.error("Deactivate StockLot Error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการปิดล็อต" });
    }
};

