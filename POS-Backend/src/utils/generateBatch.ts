import StockLot ,{ IStockLot } from "../models/StockLot";
import Product from "../models/Product";


/**
 * 🧮 Generate Batch Number (Auto Increment per product/supplier/warehouse)
 * รูปแบบ: LOT-YYYYMMDD-WHxx-SPxx-xxxxx-####
 */
export const generateBatchNumber = async (
    warehouseCode: string,
    supplierCode: string,
    productId: string
): Promise<string> => {
    // 🧱 หาข้อมูลสินค้า
    const product = await Product.findById(productId)
        .select("barcode")
        .lean<{ _id: string; barcode: string }>();

    if (!product) throw new Error(`Product not found: ${productId}`);

    const productPart = product.barcode?.slice(-5) || productId.slice(-5);
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    // ✅ prefix สำหรับค้นหาเฉพาะสินค้านี้ warehouse/supplier เดียวกัน
    const prefix = `LOT-\\d{8}-${warehouseCode}-${supplierCode}-${productPart}-`;

    // ✅ หา batch ล่าสุดของสินค้านี้ (warehouse + supplier + barcode เดียวกัน)
    const lastLot = await StockLot.findOne({
        productId,
        batchNumber: { $regex: prefix }, // regex ยืดหยุ่น (ข้ามวันได้)
    })
        .sort({ createdAt: -1 })
        .lean<IStockLot | null>(); // ✅ ระบุ type ให้ชัด


    let nextNumber = 1;

    if (lastLot?.batchNumber) {
        const match = lastLot.batchNumber.match(/-(\d{4})$/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    const newBatch = `LOT-${datePart}-${warehouseCode}-${supplierCode}-${productPart}-${String(
        nextNumber
    ).padStart(4, "0")}`;

    return newBatch;
};
