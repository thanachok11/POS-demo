import mongoose, { Document, Schema } from "mongoose";

export interface IQC extends Document {
    batchNumber: string; // รหัสล็อต เช่น LOT-20251010-WH01-SP02-3982
    productId: mongoose.Schema.Types.ObjectId; // สินค้าที่ตรวจ
    supplierId: mongoose.Schema.Types.ObjectId; // ซัพพลายเออร์
    warehouseId: mongoose.Schema.Types.ObjectId; // คลังที่เก็บ
    userId: mongoose.Schema.Types.ObjectId; // ผู้ตรวจสอบ (เจ้าหน้าที่ QC)
    purchaseOrderId?: mongoose.Schema.Types.ObjectId; // ✅ ใบสั่งซื้อที่ล็อตนี้มาจาก
    stockLotId?: mongoose.Schema.Types.ObjectId; // ✅ ลิงก์ไปยัง StockLot เพื่อ sync สถานะ
    status: "ผ่าน" | "ไม่ผ่าน" | "รอตรวจ"; // ผลการตรวจ
    issues?: string[]; // รายการปัญหาที่พบ เช่น ["กลิ่นผิดปกติ", "บรรจุภัณฑ์รั่ว"]
    temperature?: number; // อุณหภูมิระหว่างตรวจ (ถ้ามี)
    humidity?: number; // ความชื้นระหว่างตรวจ (ถ้ามี)
    inspectionDate: Date; // วันที่ตรวจ
    remarks?: string; // หมายเหตุเพิ่มเติม
    attachments?: { url: string; public_id: string }[]; // รูปภาพแนบจาก Cloudinary
    createdAt: Date;
    updatedAt: Date;
}

const QCSchema = new Schema<IQC>(
    {
        batchNumber: { type: String, required: true, index: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
        warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

        // ✅ เพิ่มฟิลด์เชื่อมโยง PO และ StockLot
        purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },
        stockLotId: { type: Schema.Types.ObjectId, ref: "StockLot" },

        status: { type: String, enum: ["ผ่าน", "ไม่ผ่าน", "รอตรวจ"], default: "รอตรวจ" },
        issues: [{ type: String }],
        temperature: Number,
        humidity: Number,
        inspectionDate: { type: Date, default: Date.now },
        remarks: String,
        attachments: [
            {
                url: String,
                public_id: String,
            },
        ],
    },
    { timestamps: true }
);

// 📊 Indexes เพื่อค้นหาเร็วขึ้น
QCSchema.index({ status: 1 });
QCSchema.index({ productId: 1, warehouseId: 1 });
QCSchema.index({ batchNumber: 1, purchaseOrderId: 1 });
QCSchema.index({ stockLotId: 1 });

export default mongoose.models.QC || mongoose.model<IQC>("QC", QCSchema);
