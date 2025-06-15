import { Request, Response } from "express";
import Warehouse from "../models/Warehouse";
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    // สามารถเพิ่มข้อมูลอื่น ๆ ใน payload ได้ถ้ามี
}

// ฟังก์ชันช่วยตรวจสอบ token และคืน payload
const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return decoded as JwtPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// สร้างคลังสินค้าใหม่ พร้อมเก็บ userId จาก token
export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token not provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const { name, location, description } = req.body;
        if (!name) throw new Error("กรุณาระบุชื่อคลังสินค้า");

        const warehouse = new Warehouse({
            name,
            location,
            description,
            userId: decoded.userId, // ใส่ userId จาก token
        });

        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Unauthorized" });
    }
};

// ดึงคลังสินค้าของ user นั้นเท่านั้น
export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token not provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const warehouses = await Warehouse.find({ userId: decoded.userId });
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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token not provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const warehouse = await Warehouse.findOneAndDelete({ _id: req.params.id, userId: decoded.userId });
        if (!warehouse) {
            res.status(404).json({ error: "ไม่พบคลังสินค้า" });
            return;
        }
        res.json({ message: "ลบคลังสินค้าเรียบร้อยแล้ว" });
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Unauthorized" });
    }
};

