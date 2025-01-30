import mongoose, { Document, Schema } from 'mongoose';

// สร้าง interface สำหรับ Product
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  imageUrl?: string;  // URL รูปภาพ (อาจไม่มี)
  public_id?: string; // สำหรับการจัดการรูป (อาจไม่มี)
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String }, // เก็บ URL ของภาพจาก Cloudinary
    public_id: { type: String, required: false }, // ไม่จำเป็นต้อง required
  },
  { timestamps: true } // ไม่ต้องกำหนด createdAt และ updatedAt เอง
);

// ใช้ mongoose.models.Product ป้องกันการสร้าง model ซ้ำ
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
