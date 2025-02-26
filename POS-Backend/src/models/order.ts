import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  supplier: mongoose.Schema.Types.ObjectId; // อ้างอิงถึง Supplier
  productName: string; // ชื่อสินค้า
  quantity: number; // จำนวนที่ต้องการสั่งซื้อ
  orderDate: Date; // วันที่สั่งซื้อ
  status: "pending" | "completed" | "cancelled"; // สถานะการสั่งซื้อ
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
