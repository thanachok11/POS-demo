import mongoose, { Schema, Document } from "mongoose";

// 1. สร้าง Interface สำหรับ TypeScript
export interface IPayment extends Document {
    saleId: string; // รหัสคำสั่งซื้อ
    employeeName: string; // ชื่อลูกค้า
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    amountReceived:string;
    amount: number; // ยอดเงินที่ชำระ
    status: "รอดำเนินการ" | "สำเร็จ" | "ล้มเหลว";
    createdAt: Date;
}

// 2. กำหนด Schema
const PaymentSchema = new Schema<IPayment>({
    saleId: { type: String, required: true },
    employeeName: { type: String, required: true },
    paymentMethod: {
        type: String,
        enum: ["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code"],
        required: true,
    },
    amountReceived: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["รอดำเนินการ", "สำเร็จ", "ล้มเหลว"],
        default: "รอดำเนินการ",
    },
    createdAt: { type: Date, default: Date.now },
});

// 3. สร้าง Model
const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
