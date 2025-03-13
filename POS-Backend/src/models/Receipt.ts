import mongoose, { Schema, Document } from "mongoose";

// 🔹 กำหนด Interface สำหรับ Receipt
interface IReceipt extends Document {
    paymentId: mongoose.Types.ObjectId;
    employeeName: string;
    items: {
        barcode: string;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }[]; // รวม ReceiptItem เข้าไปใน items
    totalPrice: number;
    paymentMethod: "เงินสด" | "QR Code" | "บัตรเครดิต" | "โอนผ่านธนาคาร";
    amountPaid?: number; // 💰 เงินที่ลูกค้าจ่าย (เฉพาะเงินสด)
    changeAmount?: number; // 💵 เงินทอน
    timestamp: Date;
}

// 🔹 Schema สำหรับใบเสร็จ
const ReceiptSchema = new Schema<IReceipt>({
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    employeeName: { type: String, required: true },
    items: [
        {
            barcode: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            subtotal: { type: Number, required: true },
        },
    ], // รวมรายการสินค้าทั้งหมดในใบเสร็จ
    totalPrice: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ["เงินสด", "QR Code", "บัตรเครดิต", "โอนผ่านธนาคาร"],
        required: true,
    },
    amountPaid: { type: Number }, // 💰 เพิ่มจำนวนเงินที่ลูกค้าจ่าย
    changeAmount: { type: Number, default: 0 }, // 💵 เงินทอน
    timestamp: { type: Date, default: Date.now },
});

// 🔹 สร้าง Model
const Receipt = mongoose.model<IReceipt>("Receipt", ReceiptSchema);

export default Receipt;
