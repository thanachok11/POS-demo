import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
    saleId: string; // รหัสคำสั่งซื้อ / POS session
    receiptId?: mongoose.Types.ObjectId | null | any;
    employeeName: string; // ✅ พนักงานที่รับเงิน/คืนเงิน
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    type: "SALE" | "REFUND"; // ✅ เพิ่มประเภทการชำระเงิน
    amountReceived: number; // ✅ เป็นตัวเลข
    amount: number; // ✅ ยอดเงินจริง (เช่น refund จะเป็นค่าลบ)
    status: "รอดำเนินการ" | "สำเร็จ" | "ล้มเหลว";
    notes?: string; // ✅ เก็บเหตุผล เช่น "คืนสินค้า"
    createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        saleId: { type: String, required: true },
        receiptId: { type: Schema.Types.ObjectId, ref: "Receipt" },
        employeeName: { type: String, required: true },
        paymentMethod: {
            type: String,
            enum: ["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code"],
            required: true,
        },
        type: {
            type: String,
            enum: ["SALE", "REFUND"],
            default: "SALE",
        },
        amountReceived: { type: Number, required: true },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["รอดำเนินการ", "สำเร็จ", "ล้มเหลว"],
            default: "รอดำเนินการ",
        },
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// ✅ Index เพื่อให้ดึงข้อมูลเร็ว
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ receiptId: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
