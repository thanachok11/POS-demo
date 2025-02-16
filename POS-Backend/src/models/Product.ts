import mongoose, { Document, Schema } from 'mongoose';

// Interface สำหรับ Product
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  barcode: string;
  stock: number;
  imageUrl?: string;
  public_id?: string;
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
    stock: { type: Number, required: true },
    imageUrl: { type: String }, // เก็บ URL ของภาพจาก Cloudinary
    public_id: { type: String }, // เก็บ public_id ของภาพจาก Cloudinary
  },
  { timestamps: true }
);

// Export model
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
