import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  productId: mongoose.Schema.Types.ObjectId;
  productName: string;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  supplierId: mongoose.Schema.Types.ObjectId;
  supplierCompany: string;
  location: string;
  orderDate: Date;
  status:
  | "รอการชำระเงิน"
  | "ชำระเงินแล้ว"
  | "ยกเลิกรายการ"
  | "กำลังเตรียมจัดส่ง"
  | "จัดส่งแล้ว";
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false } // ไม่ต้องสร้าง _id สำหรับ item แต่ละอัน
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierCompany: { type: String, required: true },
    location: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        "รอการชำระเงิน",
        "ชำระเงินแล้ว",
        "ยกเลิกรายการ",
        "กำลังเตรียมจัดส่ง",
        "จัดส่งแล้ว",
      ],
      default: "รอการชำระเงิน",
    },
    items: { type: [OrderItemSchema], required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
