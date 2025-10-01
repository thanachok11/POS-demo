import mongoose, { Document, Schema } from "mongoose";

export interface IStockTransaction extends Document {
    stockId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: "SALE" | "RESTOCK" | "RETURN" | "ADJUSTMENT";
    quantity: number;
    referenceId?: mongoose.Types.ObjectId;
    costPrice?: number;
    salePrice?: number;
    notes?: string;
    source: "SUPPLIER" | "SELF";  // ✅ เพิ่มตรงนี้
    createdAt: Date;
    updatedAt: Date;
}

const StockTransactionSchema = new Schema<IStockTransaction>(
    {
        stockId: { type: Schema.Types.ObjectId, ref: "Stock", required: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["SALE", "RESTOCK", "RETURN", "ADJUSTMENT"],
            required: true,
        },
        quantity: { type: Number, required: true },
        referenceId: { type: Schema.Types.ObjectId, refPath: "refModel" },
        costPrice: { type: Number },
        salePrice: { type: Number },
        notes: { type: String },

        // ✅ Supplier / Self
        source: {
            type: String,
            enum: ["SUPPLIER", "SELF"],
            default: "SELF",
        },
    },
    { timestamps: true }
);

export default mongoose.models.StockTransaction ||
    mongoose.model<IStockTransaction>("StockTransaction", StockTransactionSchema);
