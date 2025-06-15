import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Stock
export interface IStock extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  quantity: number;
  supplierId: string;
  supplier: string;
  location?: mongoose.Types.ObjectId; // 🔄 ดึงจากคลังสินค้า
  threshold?: number;
  status: 'สินค้าพร้อมขาย' | 'สินค้าหมด' | 'สินค้าเหลือน้อย';
  lastRestocked?: Date;
  barcode?: string;
  unit?: string[]; // ✅ เพิ่ม unit เป็น array
  createdAt: Date;
  updatedAt: Date;
}

// Schema ของ Stock
const StockSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, default: 0 },
    supplier: { type: String },
    supplierId: { type: String, required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    threshold: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['สินค้าพร้อมขาย', 'สินค้าหมด', 'สินค้าเหลือน้อย'],
      default: 'สินค้าพร้อมขาย',
    },
    lastRestocked: { type: Date },
    barcode: { type: String, unique: true },

    unit: { type: [String], default: [] }, // ✅ เพิ่มใน Schema เป็น array of strings
  },
  { timestamps: true }
);

// ✅ ฟังก์ชันอัปเดตสถานะ
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
