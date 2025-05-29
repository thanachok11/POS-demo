import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  supplierId: mongoose.Schema.Types.ObjectId;
  supplierCompany: string;

  productName: string;
  quantity: number;
  location: string;
  orderDate: Date;
  status: "รอการชำระเงิน" | "ชำระเงินแล้ว" | "ยกเลิกรายการ";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierCompany: { type: String, required: true },

    productName: { type: String, required: true },
    location: { type: String, required:true},
    quantity: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["รอการชำระเงิน", "ชำระเงินแล้ว", "ยกเลิกรายการ"],
      default: "รอการชำระเงิน",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
