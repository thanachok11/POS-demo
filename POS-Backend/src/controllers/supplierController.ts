import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Supplier from "../models/Supplier";
import Product from "../models/Product";
import Stock from "../models/Stock";
import User from "../models/User";
import { verifyToken } from "../utils/auth";

const extractUserId = async (req: Request): Promise<string | null> => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return null;

    const decoded = verifyToken(token);
    if (typeof decoded !== "string" && "userId" in decoded) {
        const user = await User.findById(decoded.userId);
        return user ? decoded.userId : null;
    }
    return null;
};

// ===== Controllers =====

// ✅ Add supplier
export const addSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await extractUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { companyName, phoneNumber, address, country, stateOrProvince, district, subDistrict, postalCode, email } = req.body;
        if (!companyName || !phoneNumber || !address || !country || !stateOrProvince || !district || !subDistrict || !postalCode || !email) {
            res.status(400).json({ success: false, message: "All fields are required" });
            return;
        }

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
            userId,
        });

        await newSupplier.save();

        res.status(201).json({
            success: true,
            message: "Supplier added successfully",
            data: newSupplier,
        });
    } catch (error) {
        console.error("❌ addSupplier error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Get all suppliers
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await extractUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const suppliers = await Supplier.find({ userId });
        res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
        console.error("❌ getSuppliers error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Get supplier by id
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await extractUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { supplierId } = req.params;
        const supplier = await Supplier.findOne({ _id: supplierId, userId });

        if (!supplier) {
            res.status(404).json({ success: false, message: "Supplier not found" });
            return;
        }

        res.status(200).json({ success: true, data: supplier });
    } catch (error) {
        console.error("❌ getSupplierById error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Update supplier
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await extractUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { supplierId } = req.params;
        const supplier = await Supplier.findOne({ _id: supplierId, userId });
        if (!supplier) {
            res.status(404).json({ success: false, message: "Supplier not found" });
            return;
        }

        Object.assign(supplier, req.body);
        const updatedSupplier = await supplier.save();

        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: updatedSupplier,
        });
    } catch (error) {
        console.error("❌ updateSupplier error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Delete supplier
export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await extractUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { supplierId } = req.params;
        const supplier = await Supplier.findOne({ _id: supplierId, userId });
        if (!supplier) {
            res.status(404).json({ success: false, message: "Supplier not found" });
            return;
        }

        await Supplier.deleteOne({ _id: supplierId, userId });
        res.status(200).json({ success: true, message: "Supplier deleted successfully" });
    } catch (error) {
        console.error("❌ deleteSupplier error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ (Optional) Get products & stock by supplier
export const getProductsAndStockBySupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await extractUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { supplierId } = req.params;
        const supplier = await Supplier.findOne({ _id: supplierId, userId });
        if (!supplier) {
            res.status(404).json({ success: false, message: "Supplier not found" });
            return;
        }

        const products = await Product.find({ supplierId, userId });

        const productWithStock = await Promise.all(
            products.map(async (product) => {
                const stock = await Stock.findOne({ productId: product._id });
                return { product, stock };
            })
        );

        res.status(200).json({ success: true, data: productWithStock });
    } catch (error) {
        console.error("❌ getProductsAndStockBySupplier error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
