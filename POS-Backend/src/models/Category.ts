// models/Category.ts
import mongoose, { Document, Schema } from 'mongoose';

// ✅ Interface สำหรับ Category
export interface ICategory extends Document {
    name: string;
    description?: string;
    adminId: mongoose.Schema.Types.ObjectId; // ✅ เปลี่ยนจาก managerId

    createdAt: Date;
    updatedAt: Date;
}

// ✅ Schema สำหรับ Category
const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // ✅ ชัดเจนว่าอ้างถึง admin
            required: true,
        },
    },
    { timestamps: true }
);

// ✅ Export Model
export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
