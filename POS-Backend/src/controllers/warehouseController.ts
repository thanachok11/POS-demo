import { Request, Response } from "express";
import Warehouse from "../models/Warehouse";
import Stock from "../models/Stock";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
}

const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return decoded as JwtPayload;
    } catch (error) {
        throw new Error("Invalid token");
    }
};

// 🏗️ ฟังก์ชันสร้างคลัง พร้อม gen code (WH01, WH02, WH03...)
export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ success: false, message: "Token not provided" });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        const { name, location, description } = req.body;

        if (!name?.trim() || !location?.trim()) {
            res.status(400).json({ success: false, message: "กรุณาระบุชื่อและที่ตั้งคลังสินค้า" });
            return;
        }

        // 🔍 หาค่า code ที่สูงที่สุดในคลังของ user
        const lastWarehouse = await Warehouse.findOne({ userId: decoded.userId })
            .sort({ code: -1 }) // หาตามลำดับตัวอักษร เช่น WH01, WH02...
            .lean();

        let nextNumber = 1;
        if (lastWarehouse?.code) {
            const match = lastWarehouse.code.match(/\d+$/);
            if (match) nextNumber = parseInt(match[0], 10) + 1;
        }

        const newCode = `WH${String(nextNumber).padStart(2, "0")}`;

        // ✅ สร้างคลังใหม่
        const newWarehouse = new Warehouse({
            name: name.trim(),
            code: newCode,
            location: location.trim(),
            description: description || "",
            userId: decoded.userId,
        });

        await newWarehouse.save();

        res.status(201).json({
            success: true,
            message: "✅ สร้างคลังสินค้าเรียบร้อย",
            data: newWarehouse,
        });
    } catch (error: any) {
        if (error.code === 11000 && error.keyPattern?.code) {
            // 🩹 ถ้า code ซ้ำจริง ๆ (เช่น concurrent request)
            const randomCode = `WH${Date.now().toString().slice(-3)}`;
            const fallbackWarehouse = new Warehouse({
                ...req.body,
                code: randomCode,
            });
            await fallbackWarehouse.save();
            res.status(201).json({
                success: true,
                message: "✅ สร้างคลังด้วย code สำรอง (กันซ้ำ)",
                data: fallbackWarehouse,
            });
            return;
        }

        console.error("❌ createWarehouse Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error while creating warehouse",
        });
    }
};

// 🔍 ดึงคลังของ user
export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token not provided");
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const warehouses = await Warehouse.find({ userId: decoded.userId }).sort({ createdAt: -1 });
        res.json(warehouses);
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Unauthorized" });
    }
};


// ดึงคลังสินค้าตาม id เฉพาะของ user นั้น
export const getWarehouseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token not provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const warehouse = await Warehouse.findOne({ _id: req.params.id, userId: decoded.userId });
        if (!warehouse) {
            res.status(404).json({ error: "ไม่พบคลังสินค้า" });
            return;
        }
        res.json(warehouse);
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Unauthorized" });
    }
};

// อัพเดตคลังสินค้าเฉพาะของ user นั้น
export const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token not provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const { name, location, description } = req.body;
        if (req.body.code) {
            {
                res.status(400).json({ error: "ห้ามแก้ไขรหัสคลัง (code)" });
                return;
            }
        }
        const warehouse = await Warehouse.findOneAndUpdate(
            { _id: req.params.id, userId: decoded.userId },
            { name, location, description },
            { new: true }
        );

        if (!warehouse) {
            res.status(404).json({ error: "ไม่พบคลังสินค้า" });
            return;
        }
        res.json(warehouse);
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Unauthorized" });
    }
};

// ลบคลังสินค้าเฉพาะของ user นั้น
export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw new Error("Token not provided");

        const decoded = verifyToken(token);

        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            userId: decoded.userId,
        });
        if (!warehouse) {
            res.status(404).json({ error: "ไม่พบคลังสินค้า" });
            return;
        }

        // ❗ ตรวจว่ามี stock ในคลังนี้ไหม
        const inUse = await Stock.exists({ location: warehouse._id });
        if (inUse) {
            res.status(400).json({
                error: `ไม่สามารถลบคลัง "${warehouse.name}" ได้ เนื่องจากยังมีสินค้าอยู่`,
            });
            return;
        }

        await warehouse.deleteOne();
        res.json({ message: "ลบคลังสินค้าเรียบร้อยแล้ว ✅" });
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Unauthorized" });
    }
};