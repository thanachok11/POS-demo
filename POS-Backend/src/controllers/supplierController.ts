// supplierController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'; // ใช้สำหรับตรวจสอบ JWT token
import Supplier from '../models/Supplier'; // Model ของ Supplier
import Product from '../models/Product'; // อย่าลืมนำเข้า model สินค้า
import Stock from '../models/Stock';
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
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized, no token provided'
        });
        return;
    }

    try {
        const decoded = verifyToken(token);

        if (typeof decoded !== 'string' && 'userId' in decoded) {
            const userId = decoded.userId;
            const {supplierId } = req.params; // รับ supplierId จาก URL params

            // ค้นหาซัพพลายเออร์ที่ตรงกับ id และเป็นของ userId ที่ล็อกอินอยู่
            const supplier = await Supplier.findOne({ _id: supplierId, userId });

            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: supplier
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getProductsAndStockBySupplier = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized, no token provided'
        });
        return;
    }

    try {
        const decoded = verifyToken(token);

        if (typeof decoded !== 'string' && 'userId' in decoded) {
            const userId = decoded.userId;
            const { supplierId } = req.params;

            // ตรวจสอบว่า supplier เป็นของ user นี้
            const supplier = await Supplier.findOne({ _id: supplierId, userId });
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }

            // ดึงสินค้า
            const products = await Product.find({ supplierId, userId });

            // ดึง stock ของสินค้าแต่ละชิ้น
            const productWithStock = await Promise.all(
                products.map(async (product) => {
                    const stock = await Stock.findOne({ productId: product._id });
                    return {
                        product,
                        stock
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: productWithStock
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
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

        // ตรวจสอบว่า decoded เป็น object และมี property userId หรือไม่
        if (typeof decoded !== 'string' && 'userId' in decoded) {
            const user = await User.findById(decoded.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

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
                userId: decoded.userId, // เก็บ userId ที่มาจาก token
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