import mongoose, { Schema, Document } from "mongoose";

export interface IReceiptItem {
    barcode: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    profit?: number;
}

export interface IReceipt extends Document {
    paymentId?: mongoose.Types.ObjectId | null;
    originalReceiptId?: mongoose.Types.ObjectId | null; // ✅ ใบเสร็จต้นทาง (กรณีคืนสินค้า)
    employeeName: string;
    items: IReceiptItem[];
    totalPrice: number;
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    amountPaid: number;
    changeAmount: number;
    isReturn?: boolean; // ✅ เป็นใบเสร็จคืนสินค้าหรือไม่
    returnReason?: string; // ✅ เหตุผลการคืนสินค้า
    profit?: number;
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const ReceiptItemSchema = new Schema<IReceiptItem>(
    {
        barcode: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        profit: { type: Number, default: 0 },
    },
    { _id: false } // ไม่ต้องสร้าง _id ซ้ำใน items
);

const ReceiptSchema = new Schema<IReceipt>(
    {
        paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
        originalReceiptId: { type: Schema.Types.ObjectId, ref: "Receipt", default: null }, // 🧩 อ้างถึงใบเสร็จต้นทาง
        employeeName: { type: String, required: true },

        items: {
            type: [ReceiptItemSchema],
            required: true,
            validate: {
                validator: (items: IReceiptItem[]) => items.length > 0,
                message: "ต้องมีรายการสินค้าอย่างน้อย 1 รายการ",
            },
        },

        totalPrice: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code"],
            required: true,
        },
        amountPaid: { type: Number, required: true },
        changeAmount: { type: Number, required: true },

        // 🔁 คืนสินค้า
        isReturn: { type: Boolean, default: false },
        returnReason: { type: String, default: null },

        // 💰 กำไรต่อใบเสร็จ
        profit: { type: Number, default: 0 },

        // ⏰ เวลาออกใบเสร็จ
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// ✅ Index เพื่อดึงข้อมูลเร็วขึ้น
ReceiptSchema.index({ timestamp: -1 });
ReceiptSchema.index({ employeeName: 1 });
ReceiptSchema.index({ isReturn: 1 });
ReceiptSchema.index({ originalReceiptId: 1 });

const Receipt = mongoose.model<IReceipt>("Receipt", ReceiptSchema);
export default Receipt;
