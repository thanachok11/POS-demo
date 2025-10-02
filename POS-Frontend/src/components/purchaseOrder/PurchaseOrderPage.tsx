import React, { useEffect, useState } from "react";
import {
    getPurchaseOrders,
    confirmPurchaseOrder,
    updateQCStatus,
    cancelPurchaseOrder,
    returnPurchaseOrder,   // ✅ เพิ่ม
} from "../../api/purchaseOrder/purchaseOrderApi";
import "../../styles/purchaseOrder/PurchaseOrderPage.css";
import { createTransaction } from "../../api/stock/transactionApi";

interface Item {
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    batchNumber: string;
    expiryDate?: string;
}

interface PurchaseOrder {
    _id: string;
    purchaseOrderNumber: string;
    items: Item[];
    location: string;
    status: string;
    qcStatus: string;
    orderDate: string;
    supplierCompany: string;
    totalAmount: number;
    invoiceNumber?: string;
}

const qcOptions = ["รอตรวจสอบ", "ผ่าน", "ไม่ผ่าน"];

const PurchaseOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingIds, setUpdatingIds] = useState<string[]>([]);

    // ================== โหลด Purchase Orders ==================
    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await getPurchaseOrders(token);

            if (res.success) {
                setOrders(res.data);
            } else {
                setError(res.message || "โหลด Purchase Orders ไม่สำเร็จ");
            }
        } catch {
            setError("เกิดข้อผิดพลาดในการโหลด Purchase Orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const formatThaiDateTime = (dateString: string) =>
        new Date(dateString)
            .toLocaleString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Bangkok",
            })
            .replace("น.", "")
            .trim() + " น.";

    // ================== Confirm PO ==================
    const handleConfirm = async (poId: string) => {
        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await confirmPurchaseOrder(poId, token);
            alert(res.message);

            if (res.success) {
                setOrders((prev) =>
                    prev.map((po) =>
                        po._id === poId ? { ...po, status: "ได้รับสินค้าแล้ว" } : po
                    )
                );
            }
        } catch {
            alert("เกิดข้อผิดพลาดในการ Confirm PO");
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ================== Update QC Status ==================
    const handleUpdateQC = async (poId: string, newStatus: string) => {
        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await updateQCStatus(poId, newStatus as any, token);
            alert(res.message);

            if (res.success) {
                setOrders((prev) =>
                    prev.map((po) =>
                        po._id === poId
                            ? {
                                ...po,
                                qcStatus: newStatus,
                                status:
                                    newStatus === "ไม่ผ่าน"
                                        ? "ไม่ผ่าน QC - รอส่งคืนสินค้า"
                                        : po.status,
                            }
                            : po
                    )
                );

                // ✅ ถ้า QC ผ่าน → เติมสต็อก
                if (newStatus === "ผ่าน") {
                    const currentPO = orders.find((po) => po._id === poId);
                    if (currentPO) {
                        for (const item of currentPO.items) {
                            try {
                                await createTransaction(
                                    {
                                        stockId: item.productId,
                                        productId: item.productId,
                                        type: "RESTOCK",
                                        quantity: item.quantity,
                                        costPrice: item.costPrice,
                                        notes: `เติมสต็อกจาก PO ${currentPO.purchaseOrderNumber}`,
                                    },
                                    token
                                );
                            } catch (err) {
                                console.error("❌ CreateTransaction Error:", err);
                            }
                        }
                    }
                }
            }
        } catch {
            alert("เกิดข้อผิดพลาดในการอัปเดต QC");
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ================== Cancel PO ==================
    const handleCancel = async (poId: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะยกเลิก PO นี้?")) return;

        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await cancelPurchaseOrder(poId, token);
            alert(res.message);

            if (res.success) {
                setOrders((prev) =>
                    prev.map((po) =>
                        po._id === poId ? { ...po, status: "ยกเลิก" } : po
                    )
                );
            }
        } catch {
            alert("เกิดข้อผิดพลาดในการยกเลิก PO");
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ================== Return PO ==================
    const handleReturn = async (poId: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะคืนสินค้า PO นี้?")) return;

        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await returnPurchaseOrder(poId, token);
            alert(res.message);

            if (res.success) {
                setOrders((prev) =>
                    prev.map((po) =>
                        po._id === poId
                            ? { ...po, status: "ไม่ผ่าน QC - คืนสินค้าแล้ว" }
                            : po
                    )
                );
            }
        } catch {
            alert("เกิดข้อผิดพลาดในการคืนสินค้า PO");
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };
    const statusClassMap: Record<string, string> = {
        "รอดำเนินการ": "pending",
        "ได้รับสินค้าแล้ว": "received",
        "ยกเลิก": "cancelled",
        "ไม่ผ่าน QC - รอส่งคืนสินค้า": "qc-pending-return",
        "ไม่ผ่าน QC - คืนสินค้าแล้ว": "qc-returned",
    };


    // ================== UI ==================
    if (loading) return <p className="order-loading">กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="order-error">{error}</p>;

    return (
        <div className="po-display">
            <div className="po-container">
                <div className="po-header-wrapper">
                    <h1 className="po-header">รายการ Purchase Orders</h1>
                </div>

                {orders.length === 0 ? (
                    <p className="po-empty">ยังไม่มี Purchase Order</p>
                ) : (
                    <div className="po-list">
                        {orders.map((po) => {
                            const isUpdating = updatingIds.includes(po._id);
                            return (
                                <div key={po._id} className="po-card">
                                    <div className="po-card-header">
                                        <h2>{po.purchaseOrderNumber}</h2>
                                        <span className={`po-status ${statusClassMap[po.status] || ""}`}>
                                            {po.status}
                                        </span>
                                    </div>

                                    <p>สถานะ QC: {po.qcStatus}</p>
                                    <p>สถานที่รับสินค้า: {po.location}</p>
                                    <p>ผู้จัดส่ง: {po.supplierCompany}</p>
                                    <p>ยอดรวม: {po.totalAmount.toLocaleString()} บาท</p>
                                    <p>วันที่สั่งซื้อ: {formatThaiDateTime(po.orderDate)}</p>

                                    <div className="po-items">
                                        <h4>รายการสินค้า:</h4>
                                        <ul>
                                            {po.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.productName} - {item.quantity} ชิ้น
                                                    (ต้นทุน: {item.costPrice} บาท,
                                                    Batch: {item.batchNumber})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="po-actions">
                                        {/* Confirm PO */}
                                        {po.status === "รอดำเนินการ" && (
                                            <button
                                                onClick={() => handleConfirm(po._id)}
                                                disabled={isUpdating}
                                            >
                                                ✅ Confirm PO
                                            </button>
                                        )}

                                        {/* Update QC */}
                                        {po.status === "ได้รับสินค้าแล้ว" && (
                                            <select
                                                value={po.qcStatus}
                                                onChange={(e) =>
                                                    handleUpdateQC(po._id, e.target.value)
                                                }
                                                disabled={isUpdating}
                                            >
                                                {qcOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Cancel PO */}
                                        {po.status === "รอดำเนินการ" && (
                                            <button
                                                className="po-cancel-button"
                                                onClick={() => handleCancel(po._id)}
                                                disabled={isUpdating}
                                            >
                                                ❌ ยกเลิก
                                            </button>
                                        )}

                                        {/* Return PO */}
                                        {po.status === "ไม่ผ่าน QC - รอส่งคืนสินค้า" && (
                                            <button
                                                className="po-return-button"
                                                onClick={() => handleReturn(po._id)}
                                                disabled={isUpdating}
                                            >
                                                ↩️ คืนสินค้า
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderPage;
