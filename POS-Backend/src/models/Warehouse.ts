// models/Warehouse.ts
import mongoose, { Schema } from "mongoose";

const warehouseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true, // ห้ามซ้ำ เพื่อใช้เป็นรหัสประจำคลัง เช่น WH01, WH02
    },
    location: String,
    description: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Warehouse", warehouseSchema);
