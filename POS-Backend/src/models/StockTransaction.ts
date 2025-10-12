import mongoose, { Document, Schema } from "mongoose";

export interface IStockTransaction extends Document {
    stockId: mongoose.Types.ObjectId;
    stockLotId?: mongoose.Types.ObjectId; // ✅ อ้างอิงล็อต
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: "SALE" | "RESTOCK" | "RETURN" | "ADJUSTMENT";
    quantity: number;
    referenceId?: mongoose.Types.ObjectId;
    qcReference?: mongoose.Types.ObjectId;
    costPrice?: number;
    salePrice?: number;
    notes?: string;
    source: "SUPPLIER" | "SELF" | "CUSTOMER";
    createdAt: Date;
    updatedAt: Date;
}

const StockTransactionSchema = new Schema<IStockTransaction>(
    {
        stockId: { type: Schema.Types.ObjectId, ref: "Stock", required: true },
        stockLotId: { type: Schema.Types.ObjectId, ref: "StockLot" }, // ✅ ผูกล็อต
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["SALE", "RESTOCK", "RETURN", "ADJUSTMENT"],
            required: true,
        },
        quantity: { type: Number, required: true },
        referenceId: { type: Schema.Types.ObjectId, refPath: "refModel" },
        qcReference: { type: Schema.Types.ObjectId, ref: "QC" },
        costPrice: Number,
        salePrice: Number,
        notes: String,
        source: {
            type: String,
            enum: ["SUPPLIER", "SELF", "CUSTOMER"],
            default: "SELF",
        },
    },
    { timestamps: true }
);

// ✅ Indexes
StockTransactionSchema.index({ stockId: 1 });
StockTransactionSchema.index({ stockLotId: 1 });
StockTransactionSchema.index({ qcReference: 1 });
StockTransactionSchema.index({ createdAt: -1 });

export default mongoose.models.StockTransaction ||
    mongoose.model<IStockTransaction>("StockTransaction", StockTransactionSchema);
