import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    saleId: string;                // รหัสอ้างอิงการขาย (string ไว้แสดงในใบเสร็จ เช่น timestamp หรือ running no.)
    userId: mongoose.Types.ObjectId; // พนักงานที่ขาย
    items: {
        productId: mongoose.Types.ObjectId;
        barcode: string;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }[];
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    amount: number;          // ราคารวม
    amountReceived: number;  // จำนวนเงินที่ลูกค้าจ่ายมา
    change: number;          // เงินทอน
    createdAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
    {
        saleId: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                barcode: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                subtotal: { type: Number, required: true },
            },
        ],
        paymentMethod: {
            type: String,
            enum: ["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code"],
            required: true,
        },
        amount: { type: Number, required: true },
        amountReceived: { type: Number, required: true },
        change: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);