import { Product } from "./productTypes";
import { Supplier } from "./supplierTypes";
import { Warehouse } from "./warehouseTypes";

export interface IStockLot {
    _id: string;
    stockId: string;
    productId: Product;
    supplierId?: Supplier;
    supplierName?: string;
    userId: string;
    location?: Warehouse;
    batchNumber: string;
    expiryDate?: string;
    barcode: string;
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    quantity: number;
    costPrice: number;
    salePrice?: number;
    status: "สินค้าพร้อมขาย" | "สินค้าหมด" | "สินค้าเหลือน้อย" | "รอตรวจสอบ QC" | "รอคัดออก";
    qcStatus: "ผ่าน" | "ไม่ผ่าน" | "รอตรวจสอบ";
    isActive: boolean;
    isTemporary?: boolean;
    lastRestocked?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
