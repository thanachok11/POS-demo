import React, { useEffect, useState } from "react";
import {
    getPurchaseOrders,
    confirmPurchaseOrder,
    updateQCStatus,
    cancelPurchaseOrder,
} from "../../api/purchaseOrder/purchaseOrderApi";
import "../../styles/purchaseOrder/PurchaseOrderPage.css";

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

    // ✅ โหลด Purchase Orders
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

    // ✅ Confirm PO
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

    // ✅ Update QC Status
    const handleUpdateQC = async (poId: string, newStatus: string) => {
        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await updateQCStatus(poId, newStatus as any, token);
            alert(res.message);

            if (res.success) {
                setOrders((prev) =>
                    prev.map((po) =>
                        po._id === poId ? { ...po, qcStatus: newStatus } : po
                    )
                );
            }
        } catch {
            alert("เกิดข้อผิดพลาดในการอัปเดต QC");
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ✅ Cancel PO
    const handleCancel = async (poId: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะยกเลิก PO นี้?")) return;

        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await cancelPurchaseOrder(poId, token);
            alert(res.message);

            if (res.success) {
                setOrders((prev) =>
                    prev.map((po) => (po._id === poId ? { ...po, status: "ยกเลิก" } : po))
                );
            }
        } catch {
            alert("เกิดข้อผิดพลาดในการยกเลิก PO");
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ✅ UI
    if (loading) return <p className="order-loading">กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="order-error">{error}</p>;

    return (
        <div className="display">
            <div className="order-container">
                <h1 className="order-title">รายการ Purchase Orders</h1>

                {orders.length === 0 ? (
                    <p className="order-empty">ยังไม่มี Purchase Order</p>
                ) : (
                    <div className="order-list">
                        {orders.map((po) => {
                            const isUpdating = updatingIds.includes(po._id);
                            return (
                                <div key={po._id} className="order-card">
                                    <div className="order-card-header">
                                        <h2>{po.purchaseOrderNumber}</h2>
                                        <span className={`order-status status-${po.status}`}>
                                            {po.status}
                                        </span>
                                    </div>

                                    <p>สถานะ QC: {po.qcStatus}</p>
                                    <p>สถานที่รับสินค้า: {po.location}</p>
                                    <p>ผู้จัดส่ง: {po.supplierCompany}</p>
                                    <p>ยอดรวม: {po.totalAmount.toLocaleString()} บาท</p>
                                    <p>วันที่สั่งซื้อ: {formatThaiDateTime(po.orderDate)}</p>

                                    <div className="order-items">
                                        <h4>รายการสินค้า:</h4>
                                        <ul>
                                            {po.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.productName} - {item.quantity} ชิ้น (ต้นทุน:{" "}
                                                    {item.costPrice} บาท, Batch: {item.batchNumber})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="order-actions">
                                        {po.status === "รอดำเนินการ" && (
                                            <button
                                                onClick={() => handleConfirm(po._id)}
                                                disabled={isUpdating}
                                            >
                                                ✅ Confirm PO
                                            </button>
                                        )}

                                        {po.status === "ได้รับสินค้าแล้ว" && (
                                            <select
                                                value={po.qcStatus}
                                                onChange={(e) => handleUpdateQC(po._id, e.target.value)}
                                                disabled={isUpdating}
                                            >
                                                {qcOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {po.status !== "ยกเลิก" && (
                                            <button
                                                className="cancel-button"
                                                onClick={() => handleCancel(po._id)}
                                                disabled={isUpdating}
                                            >
                                                ❌ ยกเลิก
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
