// models/Order.ts
import { Schema, model, Document } from 'mongoose';

// สร้าง Interface สำหรับ TypeScript
interface IOrder extends Document {
  quantity: number;
  supplier: string;
  location: string;
  orderDate: Date;
  status: string;
}

const orderSchema = new Schema<IOrder>({
  quantity: { type: Number, required: true },
  supplier: { type: String, required: true },
  location: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }, // สถานะของใบสั่งซื้อ เช่น Pending, Completed
});

const Order = model<IOrder>('Order', orderSchema);

export default Order;
