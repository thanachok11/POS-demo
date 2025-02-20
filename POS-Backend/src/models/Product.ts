import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Product
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  barcode: string;
  imageUrl?: string;
  public_id?: string;
  userId: mongoose.Schema.Types.ObjectId; // เพิ่ม userId เพื่อเชื่อมโยงกับผู้ใช้
  createdAt: Date;
  updatedAt: Date;
}

// Schema ของ Product
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    imageUrl: { type: String }, // เก็บ URL ของภาพจาก Cloudinary
    public_id: { type: String }, // เก็บ public_id ของภาพจาก Cloudinary
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // เพิ่ม userId ที่เป็น ObjectId ของผู้ใช้
  },
  { timestamps: true }
);

// Export model
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
