import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Stock
export interface IStock extends Document {
  productId: mongoose.Types.ObjectId; // อ้างอิงไปยัง Product
  userId: mongoose.Types.ObjectId; // อ้างอิงไปยัง User
  quantity: number; // จำนวนสินค้าคงเหลือ
  supplierId: string; // ชื่อบริษัทผู้จัดจำหน่าย
  supplier: string; // เชื่อมกับ Supplier
  location?: string; // ตำแหน่งจัดเก็บ
  threshold?: number; // ค่าขั้นต่ำที่ต้องมีในสต็อก
  status: 'สินค้าพร้อมขาย' | 'สินค้าหมด' | 'สินค้าเหลือน้อย'; // สถานะของสินค้า
  lastRestocked?: Date; // วันที่เติมสต็อกล่าสุด
  barcode?: string; // รหัสบาร์โค้ดของสินค้า
  unit: string[]; // ✅ เปลี่ยนเป็น array
  costPrice: number; // ราคาทุน
  sellingPrice: number; // ราคาขาย
  isActive?: boolean; // เปิดใช้งานสินค้าหรือไม่
  batchNumber?: string; // รหัสล็อต
  restockHistory?: {
    date: Date;
    quantityAdded: number;
    userId: mongoose.Types.ObjectId;
    note?: string;
  }[]; // ✅ รองรับประวัติการเติมสินค้า
  createdAt: Date;
  updatedAt: Date;
}


// Schema ของ Stock
const StockSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, default: 0 },
  supplierId: { type: String, required: true },
  supplier: { type: String },
  location: { type: String },
  threshold: { type: Number, default: 5 },
  status: {
    type: String,
    enum: ['สินค้าพร้อมขาย', 'สินค้าหมด', 'สินค้าเหลือน้อย'],
    default: 'สินค้าพร้อมขาย',
  },
  lastRestocked: { type: Date },
  barcode: { type: String, unique: true, index: true },
  // ✅ เปลี่ยนจาก string เป็น array
  unit: {
    type: [String],
    default: ['ชิ้น'],
  },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  batchNumber: { type: String },

  restockHistory: [
    {
      date: { type: Date, default: Date.now },
      quantityAdded: Number,
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      note: String,
    },
  ],
}, { timestamps: true });


// Export model
export default mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
