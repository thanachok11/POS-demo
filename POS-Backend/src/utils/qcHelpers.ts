import mongoose from "mongoose";
import Stock from "../models/Stock";
import StockLot from "../models/StockLot";
import StockTransaction from "../models/StockTransaction";
import PurchaseOrder from "../models/PurchaseOrder";


interface IPurchaseOrderLean {
    _id: mongoose.Types.ObjectId;
    items: { batchNumber: string; quantity: number; productId: mongoose.Types.ObjectId }[];
    qcStatus?: string;
    status?: string;
}

/** รวมยอด stock.totalQuantity จาก lots ที่พร้อมขาย (isActive && status=สินค้าพร้อมขาย) */
export async function updateStockTotalFromLots(stockId: string) {
    try {
        const lots = await StockLot.find({
            stockId,
            isActive: true,
            status: "สินค้าพร้อมขาย",
        }).lean();

        const totalQuantity = lots.reduce((sum, lot) => sum + (lot.quantity || 0), 0);
        const stock = await Stock.findById(stockId);
        if (!stock) return;

        // ✅ เช็ก threshold จาก Stock
        const threshold = stock.threshold ?? 5;

        let newStatus: string;
        if (totalQuantity === 0) newStatus = "สินค้าหมด";
        else if (totalQuantity <= threshold) newStatus = "สินค้าเหลือน้อย";
        else newStatus = "สินค้าพร้อมขาย";

        // ✅ อัปเดตค่าใน Stock
        stock.totalQuantity = totalQuantity;
        stock.status = newStatus;
        stock.lastRestocked = new Date();
        await stock.save();

        console.log(`✅ อัปเดต Stock ${stockId} → จำนวน ${totalQuantity} | สถานะ: ${newStatus}`);
    } catch (err) {
        console.error("❌ updateStockTotalFromLots Error:", err);
    }
}

/** คำนวณสถานะ QC ของ PO ตามผล LOT ทั้งหมดใน PO */
export async function recomputePOQCStatus(poId: mongoose.Types.ObjectId) {
    const po = await PurchaseOrder.findById(poId).lean<IPurchaseOrderLean>();
    if (!po) return;
    const batchNumbers: string[] = (po.items as any[])
        .map((i) => i.batchNumber)
        .filter(Boolean);

    if (batchNumbers.length === 0) return;

    const lots = await StockLot.find({ batchNumber: { $in: batchNumbers } }).lean();

    const passed = lots.filter((l: any) => l.qcStatus === "ผ่าน").length;
    const failed = lots.filter((l: any) => l.qcStatus === "ไม่ผ่าน").length;
    const pending = lots.filter(
        (l: any) => !l.qcStatus || l.qcStatus === "รอตรวจสอบ"
    ).length;

    let qcStatus: "ผ่าน" | "ไม่ผ่าน" | "รอตรวจสอบ" | "บางส่วนผ่าน" = "รอตรวจสอบ";
    let statusForPO = "ได้รับสินค้าแล้ว";

    if (passed > 0 && failed === 0 && pending === 0) {
        qcStatus = "ผ่าน";
        statusForPO = "QC ผ่าน";
    } else if (failed > 0 && passed === 0) {
        qcStatus = "ไม่ผ่าน";
        statusForPO = "ไม่ผ่าน QC - รอคืนสินค้า";
    } else if (passed > 0 && failed > 0) {
        qcStatus = "บางส่วนผ่าน";
        statusForPO = "QC บางส่วนผ่าน";
    } else {
        qcStatus = "รอตรวจสอบ";
        statusForPO = "ได้รับสินค้าแล้ว";
    }

    await PurchaseOrder.findByIdAndUpdate(poId, {
        $set: {
            qcStatus,
            status: statusForPO,
            qcCheckedAt: new Date(),
            updatedAt: new Date(),
        },
    });

    // ✅ ถ้า QC ผ่านทั้งหมด → sync stock อีกครั้ง
    if (qcStatus === "ผ่าน") {
        const stockIds = (
            await StockLot.find({
                batchNumber: { $in: batchNumbers },
                isActive: true,
            }).select("stockId")
        ).map((l) => l.stockId);

        for (const sid of stockIds) {
            await updateStockTotalFromLots(sid);
        }
    }
}

/** นำผล QC ไปอัปเดต LOT/Stock/Transactions แบบ idempotent */
export async function applyQCToLotAndStock(opts: {
    lot: any;
    po?: any;
    newQcStatus: "ผ่าน" | "ไม่ผ่าน" | "รอตรวจ";
    userId: string;
}) {
    const { lot, po, newQcStatus, userId } = opts;

    // ⚠️ Guard: ตรวจว่ามี stockId จริงก่อน
    if (!lot.stockId) {
        console.warn(`⚠️ Lot ${lot.batchNumber} ไม่มี stockId`);
        return;
    }

    // หาจำนวนตาม PO item
    let poQty = 0;
    if (po) {
        const item = (po.items as any[]).find(
            (i) => i.batchNumber === lot.batchNumber
        );
        poQty = Number(item?.quantity ?? 0);
    }

    const prevIsActive: boolean = !!lot.isActive;
    const prevLotQty: number = Number(lot.quantity ?? 0);
    const prevQcStatus: string = lot.qcStatus ?? "รอตรวจสอบ";

    // ======================
    // CASE: QC ผ่าน
    // ======================
    if (newQcStatus === "ผ่าน") {
        lot.qcStatus = "ผ่าน";
        lot.status = "สินค้าพร้อมขาย";
        lot.isActive = true;
        lot.isTemporary = false;

        const targetQty = poQty > 0 ? poQty : prevLotQty;
        lot.quantity = targetQty;
        lot.lastRestocked = new Date();
        lot.updatedAt = new Date();
        await lot.save();

        // ✅ ป้องกันสร้าง transaction ซ้ำ
        const alreadyRestocked = await StockTransaction.exists({
            stockLotId: lot._id,
            type: "RESTOCK",
        });

        if (!alreadyRestocked) {
            await StockTransaction.create({
                stockId: lot.stockId,
                productId: lot.productId,
                stockLotId: lot._id,
                type: "RESTOCK",
                quantity: targetQty - (prevIsActive ? prevLotQty : 0),
                costPrice: lot.costPrice,
                userId,
                notes: `QC ผ่าน | Batch ${lot.batchNumber}`,
                createdAt: new Date(),
            });
        }

        await updateStockTotalFromLots(lot.stockId);
    }

    // ======================
    // CASE: QC ไม่ผ่าน
    // ======================
    else if (newQcStatus === "ไม่ผ่าน") {
        const needDecrement = prevIsActive && prevLotQty > 0;

        lot.qcStatus = "ไม่ผ่าน";
        lot.status = "รอคัดออก";
        lot.isActive = false;
        lot.isTemporary = true;
        lot.updatedAt = new Date();
        await lot.save();

        if (needDecrement) {
            await updateStockTotalFromLots(lot.stockId);

            const alreadyReturned = await StockTransaction.exists({
                stockLotId: lot._id,
                type: "RETURN",
            });

            if (!alreadyReturned) {
                await StockTransaction.create({
                    stockId: lot.stockId,
                    productId: lot.productId,
                    stockLotId: lot._id,
                    type: "RETURN",
                    quantity: prevLotQty,
                    costPrice: lot.costPrice,
                    userId,
                    notes: `QC ไม่ผ่าน | Batch ${lot.batchNumber}`,
                    createdAt: new Date(),
                });
            }
        }
    }

    // ======================
    // CASE: รอตรวจ
    // ======================
    else {
        lot.qcStatus = "รอตรวจสอบ";
        if (!lot.status || lot.status === "รอตรวจสอบ QC") {
            lot.status = "รอตรวจสอบ QC";
        }
        lot.isActive = false;
        lot.updatedAt = new Date();
        await lot.save();
    }
}
