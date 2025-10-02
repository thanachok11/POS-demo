import mongoose, { Document, Schema } from 'mongoose';

export interface IUnit {
  name: string;      // เช่น "กล่อง"
  quantity: number;  // 1 กล่อง = 12 ชิ้น
}

export interface IStock extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  location?: mongoose.Types.ObjectId; // คลังสินค้า

  quantity: number;
  threshold?: number;
  status: 'สินค้าพร้อมขาย' | 'สินค้าหมด' | 'สินค้าเหลือน้อย';

  costPrice: number;     // ราคาทุนล่าสุด
  salePrice: number;     // ราคาขายล่าสุด
  lastPurchasePrice?: number; // ราคาที่ซื้อเข้ามาล่าสุด
  units: IUnit[];        // multi-unit conversion
  barcode?: string;
  batchNumber?: string;
  expiryDate?: Date;

  lastRestocked?: Date;
  notes?: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  updateStatus: () => Promise<void>;
}

const StockSchema = new Schema<IStock>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },

    location: { type: Schema.Types.ObjectId, ref: 'Warehouse' },

    quantity: { type: Number, default: 0 },
    threshold: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['สินค้าพร้อมขาย', 'สินค้าหมด', 'สินค้าเหลือน้อย'],
      default: 'สินค้าพร้อมขาย',
    },

    costPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    lastPurchasePrice: { type: Number },

    units: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    barcode: { type: String, unique: true },
    batchNumber: { type: String },
    expiryDate: { type: Date },

    lastRestocked: { type: Date },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// อัปเดตสถานะอัตโนมัติ
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

StockSchema.index({ productId: 1, location: 1 });
StockSchema.index({ supplierId: 1 });

export default mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
