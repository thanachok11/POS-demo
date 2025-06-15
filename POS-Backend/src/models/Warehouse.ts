// models/Warehouse.ts
import mongoose, { Schema } from "mongoose";

const warehouseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: String,
    description: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // เพิ่ม userId
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Warehouse", warehouseSchema);
