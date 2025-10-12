import React, { useEffect, useState } from "react";
import {
    getPurchaseOrders,
    confirmPurchaseOrder,
    cancelPurchaseOrder,
    returnPurchaseOrder,
} from "../../api/purchaseOrder/purchaseOrderApi";
import { useNavigate } from "react-router-dom";

import "../../styles/purchaseOrder/PurchaseOrderPage.css";
import PurchaseOrderPopup from "./PurchaseOrderPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVial } from "@fortawesome/free-solid-svg-icons";

interface Item {
    stockId: string;
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    costPrice: number;
    batchNumber: string;
    expiryDate?: string;
}

interface WarehouseInfo {
    _id: string;
    name?: string;
    code?: string;
}

interface PurchaseOrder {
    _id: string;
    purchaseOrderNumber: string;
    items: Item[];
    location: string | WarehouseInfo;
    status: string;
    qcStatus: string;
    orderDate: string;
    supplierCompany: string;
    totalAmount: number;
    invoiceNumber?: string;
}

const PurchaseOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingIds, setUpdatingIds] = useState<string[]>([]);
    const [popup, setPopup] = useState<{
        type: "success" | "error" | "confirm";
        message: string;
        onConfirm?: () => void;
    } | null>(null);

    const navigate = useNavigate();

    // ================== โหลด Purchase Orders ==================
    const loadOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await getPurchaseOrders(token);
            if (res.success) setOrders(res.data);
            else setError(res.message || "โหลด Purchase Orders ไม่สำเร็จ");
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

    // Popup confirm
    const openConfirmPopup = (message: string, onConfirm: () => void) => {
        setPopup({ type: "confirm", message, onConfirm });
    };

    // ================== Confirm PO ==================
    const handleConfirm = async (poId: string) => {
        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await confirmPurchaseOrder(poId, token);
            if (res.success) {
                setPopup({
                    type: "success",
                    message: "✅ ยืนยันรับสินค้าเรียบร้อยแล้ว",
                    onConfirm: async () => {
                        setPopup(null);
                        navigate(`/qc/${poId}`); // ✅ ไปหน้า QC หลังยืนยันสำเร็จ
                    },
                });
                await loadOrders();
            } else {
                setPopup({ type: "error", message: res.message });
            }
        } catch {
            setPopup({ type: "error", message: "เกิดข้อผิดพลาดในการ Confirm PO" });
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ================== Return PO ==================
    const handleReturn = async (poId: string) => {
        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await returnPurchaseOrder(poId, token);
            if (res.success) {
                setPopup({ type: "success", message: res.message });
                await loadOrders();
            } else setPopup({ type: "error", message: res.message });
        } catch {
            setPopup({ type: "error", message: "เกิดข้อผิดพลาดในการคืนสินค้า PO" });
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    // ================== Cancel PO ==================
    const handleCancel = async (poId: string) => {
        setUpdatingIds((prev) => [...prev, poId]);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await cancelPurchaseOrder(poId, token);
            if (res.success) {
                setPopup({ type: "success", message: res.message });
                await loadOrders();
            } else setPopup({ type: "error", message: res.message });
        } catch {
            setPopup({ type: "error", message: "เกิดข้อผิดพลาดในการยกเลิก PO" });
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== poId));
        }
    };

    const statusClassMap: Record<string, string> = {
        "รอดำเนินการ": "pending",
        "ได้รับสินค้าแล้ว": "received",
        "QC ผ่าน": "qc-passed",
        "ไม่ผ่าน QC - รอส่งคืนสินค้า": "qc-pending-return",
        "ไม่ผ่าน QC - คืนสินค้าแล้ว": "qc-returned",
        "ยกเลิก": "cancelled",
    };

    // ================== UI ==================
    if (loading) return <p className="order-loading">⏳ กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="order-error">{error}</p>;

    return (
        <div className="display">
            <div className="po-container">
                <div className="po-header-wrapper">
                    <h1 className="po-header">📦 รายการใบสั่งซื้อสินค้า (Purchase Orders)</h1>
                </div>

                {orders.length === 0 ? (
                    <p className="po-empty">ยังไม่มีข้อมูลใบสั่งซื้อ</p>
                ) : (
                    <div className="po-list">
                        {orders.map((po) => {
                            const isUpdating = updatingIds.includes(po._id);
                            return (
                                <div key={po._id} className="po-card">
                                    <div className="po-card-header">
                                        <div>
                                            <h2 className="po-number">{po.purchaseOrderNumber}</h2>
                                            <p className="po-date">
                                                📅 {formatThaiDateTime(po.orderDate)}
                                            </p>
                                        </div>
                                        <span
                                            className={`po-status-badge ${statusClassMap[po.status] || ""}`}
                                        >
                                            {po.status}
                                        </span>
                                    </div>

                                    <div className="po-info">
                                        <p><strong>ผู้จัดส่ง:</strong> {po.supplierCompany}</p>
                                        <p><strong>สถานที่รับสินค้า:</strong>{" "}
                                            {typeof po.location === "object"
                                                ? po.location.name || po.location.code || "-"
                                                : po.location}
                                        </p>
                                        <p><strong>ยอดรวม:</strong> {po.totalAmount.toLocaleString()} บาท</p>
                                        <p><strong>สถานะ QC:</strong>
                                            <span className={`qc-status qc-${po.qcStatus}`}>{po.qcStatus}</span>
                                        </p>
                                    </div>

                                    {/* ตารางสินค้า */}
                                    <div className="po-items">
                                        <h4>📋 รายการล็อตสินค้า</h4>
                                        <table className="po-items-table">
                                            <thead>
                                                <tr>
                                                    <th>สินค้า</th>
                                                    <th>Barcode</th>
                                                    <th>จำนวน</th>
                                                    <th>ต้นทุน</th>
                                                    <th>Batch</th>
                                                    <th>วันหมดอายุ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {po.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.productName}</td>
                                                        <td>{item.barcode || "-"}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.costPrice.toLocaleString()} ฿</td>
                                                        <td>{item.batchNumber || "-"}</td>
                                                        <td>
                                                            {item.expiryDate
                                                                ? formatThaiDateTime(item.expiryDate)
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="po-actions">
                                        {po.status === "รอดำเนินการ" && (
                                            <>
                                                <button onClick={() => handleConfirm(po._id)} disabled={isUpdating}>
                                                    ✅ ยืนยันรับสินค้า
                                                </button>
                                                <button
                                                    className="po-cancel-button"
                                                    onClick={() =>
                                                        openConfirmPopup("คุณต้องการยกเลิกใบสั่งซื้อนี้หรือไม่?", () =>
                                                            handleCancel(po._id)
                                                        )
                                                    }
                                                    disabled={isUpdating}
                                                >
                                                    ❌ ยกเลิก
                                                </button>
                                            </>
                                        )}

                                        {po.status === "ได้รับสินค้าแล้ว" && (
                                            <button
                                                className="qc-go-button"
                                                onClick={() => navigate(`/qc/${po._id}`)}
                                            >
                                                <FontAwesomeIcon icon={faVial} /> ไปตรวจ QC
                                            </button>
                                        )}

                                        {po.status === "ไม่ผ่าน QC - รอส่งคืนสินค้า" && (
                                            <button
                                                className="po-return-button"
                                                onClick={() =>
                                                    openConfirmPopup("คุณต้องการคืนสินค้า PO นี้หรือไม่?", () =>
                                                        handleReturn(po._id)
                                                    )
                                                }
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

            {popup && (
                <PurchaseOrderPopup
                    type={popup.type}
                    message={popup.message}
                    onClose={() => setPopup(null)}
                    onConfirm={popup.onConfirm}
                />
            )}
        </div>
    );
};

export default PurchaseOrderPage;
