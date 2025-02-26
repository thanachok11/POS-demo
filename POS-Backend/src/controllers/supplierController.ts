// supplierController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'; // ใช้สำหรับตรวจสอบ JWT token
import Supplier from '../models/Supplier'; // Model ของ Supplier
import User from '../models/User'; // Model ของผู้ใช้

// Middleware สำหรับตรวจสอบ JWT Token
const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// ฟังก์ชันการดึงข้อมูลซัพพลายเออร์
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1]; // ดึง token จาก header

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized, no token provided'
        });
        return;
    }

    try {
        // ตรวจสอบ token
        const decoded = verifyToken(token);

        if (typeof decoded !== 'string' && 'userId' in decoded) {
            const userId = decoded.userId;

            // ดึงข้อมูลของผู้ใช้จากฐานข้อมูล
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // ดึงข้อมูลซัพพลายเออร์จากฐานข้อมูล
            const suppliers = await Supplier.find({ userId: userId });
            res.status(200).json({
                success: true,
                data: suppliers
            });
            return;
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(403).json({
            success: false,
            message: 'Forbidden, invalid token'
        });
        return;
    }
};
export const addSuppliers = async (req: Request, res: Response): Promise<void> => {
    // ดึง token จาก headers (Authorization header)
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'No token provided'
        });
        return;
    }

    try {
        // ตรวจสอบ token และดึง userId
        const decoded = verifyToken(token);

        if (typeof decoded !== 'string' && 'userId' in decoded) {
            const userId = decoded.userId; // ดึง userId จาก token ที่ decode แล้ว

            // ดึงข้อมูลจาก body
            const { companyName, phoneNumber, address, country, stateOrProvince, district, subDistrict, postalCode, email } = req.body;

            // ตรวจสอบว่ามีข้อมูลทั้งหมดหรือไม่
            if (!companyName || !phoneNumber || !address || !country || !stateOrProvince || !district || !subDistrict || !postalCode || !email) {
                res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
                return;
            }

            // สร้างซัพพลายเออร์ใหม่
            const newSupplier = new Supplier({
                companyName,
                phoneNumber,
                address,
                country,
                stateOrProvince,
                district,
                subDistrict,
                postalCode,
                email,
                userId // แนบ userId กับ supplier
            });

            // บันทึกข้อมูลในฐานข้อมูล
            await newSupplier.save();

            res.status(201).json({
                success: true,
                message: 'Supplier added successfully',
                data: newSupplier
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(403).json({
            success: false,
            message: 'Forbidden, invalid token or error processing request'
        });
    }
};
