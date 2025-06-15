import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Product
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Schema.Types.ObjectId; 
  barcode: string;
  imageUrl?: string;
  public_id?: string;
  userId: mongoose.Schema.Types.ObjectId; // เพิ่ม userId เพื่อเชื่อมโยงกับผู้ใช้
  createdAt: Date;
  updatedAt: Date;
  manufacturerId: mongoose.Schema.Types.ObjectId; 
  isSelfPurchased: boolean;
}

// Schema ของ Product
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    barcode: { type: String, required: true, unique: true },
    imageUrl: { type: String }, // เก็บ URL ของภาพจาก Cloudinary
    public_id: { type: String }, // เก็บ public_id ของภาพจาก Cloudinary
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    isSelfPurchased: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Export model
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
