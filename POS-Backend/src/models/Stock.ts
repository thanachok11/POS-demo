import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product';

// Interface สำหรับ Stock
export interface IStock extends Document {
  productId: mongoose.Types.ObjectId; // อ้างอิงไปยัง Product
  quantity: number; // จำนวนสินค้าคงเหลือ
  supplier?: string; // ผู้จำหน่ายสินค้า
  location?: string; // ตำแหน่งจัดเก็บ
  threshold?: number; // ค่าขั้นต่ำที่ต้องมีในสต็อก
  status: 'In Stock' | 'Out of Stock' | 'Low Stock'; // สถานะของสินค้า
  lastRestocked?: Date; // วันที่เติมสต็อกล่าสุด
  barcode?: string; // รหัสบาร์โค้ดของสินค้า
  createdAt: Date;
  updatedAt: Date;
}

// Schema ของ Stock
const StockSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // เชื่อมโยงกับ Product
    quantity: { type: Number, required: true, default: 0 }, // จำนวนสินค้าคงเหลือ
    supplier: { type: String }, // ผู้จำหน่ายสินค้า
    location: { type: String }, // ที่จัดเก็บสินค้า
    threshold: { type: Number, default: 5 }, // จำนวนขั้นต่ำ
    status: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Low Stock'],
      default: 'In Stock',
    },
    lastRestocked: { type: Date },
    barcode: { type: String, unique: true }, // รหัสบาร์โค้ดของสินค้า
  },
  { timestamps: true }
);

// ฟังก์ชันในการอัพเดตสถานะของสต็อก
StockSchema.methods.updateStatus = async function () {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.threshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  await this.save();
};

// Export model
export default mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
