import mongoose, { Document, Schema } from 'mongoose';

export interface IStockTransaction extends Document {
    stockId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    type: 'SALE' | 'RESTOCK' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
    quantity: number;
    referenceId?: mongoose.Types.ObjectId; // เช่น orderId, purchaseId
    userId: mongoose.Types.ObjectId;
    costPrice?: number;
    salePrice?: number;
    notes?: string;
    createdAt: Date;
}

const StockTransactionSchema = new Schema<IStockTransaction>(
    {
        stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        type: {
            type: String,
            enum: ['SALE', 'RESTOCK', 'RETURN', 'ADJUSTMENT', 'TRANSFER'],
            required: true,
        },
        quantity: { type: Number, required: true },
        referenceId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        costPrice: { type: Number },
        salePrice: { type: Number },
        notes: { type: String },
    },
    { timestamps: true }
);

StockTransactionSchema.index({ stockId: 1, type: 1, createdAt: -1 });

export default mongoose.models.StockTransaction ||
    mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);
