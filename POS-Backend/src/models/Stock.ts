import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Stock
export interface IStock extends Document {
  productId: mongoose.Types.ObjectId; // อ้างอิงไปยัง Product
  userId: mongoose.Types.ObjectId; // อ้างอิงไปยัง User
  quantity: number; // จำนวนสินค้าคงเหลือ
  supplier: string; // เชื่อมกับ Supplier
  location?: string; // ตำแหน่งจัดเก็บ
  threshold?: number; // ค่าขั้นต่ำที่ต้องมีในสต็อก
  status: 'สินค้าพร้อมขาย' | 'สินค้าหมด' | 'สินค้าเหลือน้อย'; // สถานะของสินค้า
  lastRestocked?: Date; // วันที่เติมสต็อกล่าสุด
  barcode?: string; // รหัสบาร์โค้ดของสินค้า
  createdAt: Date;
  updatedAt: Date;
}

// Schema ของ Stock
const StockSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // เชื่อมโยงกับ Product
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // เพิ่ม userId ที่อ้างอิงกับ User
    quantity: { type: Number, required: true, default: 0 }, // จำนวนสินค้าคงเหลือ
    supplier: { type: String },
    location: { type: String }, // ที่จัดเก็บสินค้า
    threshold: { type: Number, default: 5 }, // จำนวนขั้นต่ำ
    status: {
      type: String,
      enum: ['สินค้าพร้อมขาย', 'สินค้าหมด', 'สินค้าเหลือน้อย'],
      default: 'พร้อมขาย',
    },
    lastRestocked: { type: Date },
    barcode: { type: String, unique: true }, // รหัสบาร์โค้ดของสินค้า
  },
  { timestamps: true }
);

// ฟังก์ชันในการอัพเดตสถานะของสต็อก
StockSchema.methods.updateStatus = async function () {
  if (this.quantity <= 0) {
    this.status = 'สินค้าหมด';
  } else if (this.quantity <= this.threshold) {
    this.status = 'สินค้าเหลือน้อย';
  } else {
    this.status = 'สินค้าพร้อมขาย';
  }
  await this.save();
};

// Export model
export default mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
