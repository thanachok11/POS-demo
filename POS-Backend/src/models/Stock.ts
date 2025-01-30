import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Stock
export interface IStock extends Document {
  productId: mongoose.Types.ObjectId; // อ้างอิงไปยัง Product
  quantity: number; // จำนวนสินค้าคงเหลือ
  supplier?: string; // ผู้จำหน่ายสินค้า
  location?: string; // ตำแหน่งจัดเก็บ
  threshold?: number; // ค่าขั้นต่ำที่ต้องมีในสต็อก
  status: 'In Stock' | 'Out of Stock' | 'Low Stock'; // สถานะของสินค้า
  lastRestocked?: Date; // วันที่เติมสต็อกล่าสุด
  createdAt: Date;
  updatedAt: Date;
}

// Schema ของ Stock
const StockSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // เชื่อมกับ Product
    quantity: { type: Number, required: true },
    supplier: { type: String },
    location: { type: String },
    threshold: { type: Number, default: 5 }, // ค่าเริ่มต้นของสินค้าต่ำสุด
    status: { 
      type: String, 
      enum: ['In Stock', 'Out of Stock', 'Low Stock'], 
      default: 'In Stock' 
    },
    lastRestocked: { type: Date },
  },
  { timestamps: true } // ให้ mongoose จัดการ createdAt & updatedAt อัตโนมัติ
);

// Export model
export default mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
