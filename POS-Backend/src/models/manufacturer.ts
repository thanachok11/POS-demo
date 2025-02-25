import mongoose, { Schema, Document } from "mongoose";

interface IManufacturer extends Document {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    country: string;
    website?: string;
    productsSupplied: mongoose.Schema.Types.ObjectId[]; // เชื่อมกับสินค้า
    createdAt: Date;
    updatedAt: Date;
}

const ManufacturerSchema = new Schema<IManufacturer>(
    {
        name: { type: String, required: true }, // ชื่อบริษัทผู้ผลิต
        contactPerson: { type: String, required: true }, // ชื่อผู้ติดต่อ
        phone: { type: String, required: true }, // เบอร์ติดต่อ
        email: { type: String, required: true, unique: true }, // อีเมล
        address: { type: String, required: true }, // ที่อยู่
        country: { type: String, required: true }, // ประเทศของผู้ผลิต
        website: { type: String }, // เว็บไซต์ (ถ้ามี)
        productsSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // เชื่อมกับสินค้าที่นำเข้า
    },
    { timestamps: true }
);

export const Manufacturer = mongoose.model<IManufacturer>(
    "Manufacturer",
    ManufacturerSchema
);
