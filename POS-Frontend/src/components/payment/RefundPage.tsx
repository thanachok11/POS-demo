import React, { useState } from "react";
import { refundByReceipt } from "../../api/payment/paymentApi";
import { fetchReceiptBySaleId } from "../../api/receipt/receiptApi";
import "../../styles/payment/RefundPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faRotateLeft,
    faFileInvoice,
    faClipboardList,
    faCheckCircle,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const RefundPage: React.FC = () => {
    const [saleId, setSaleId] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<any>(null);
    const [result, setResult] = useState<any>(null);

    // 🔍 ดึงข้อมูลใบเสร็จจาก saleId
    const handleSearchReceipt = async () => {
        if (!saleId.trim()) {
            alert("กรุณากรอกเลขการขาย");
            return;
        }

        setLoading(true);
        setResult(null);
        setReceipt(null);

        const res = await fetchReceiptBySaleId(saleId.trim());
        if (res.success && res.receipt) {
            setReceipt(res.receipt);
        } else {
            alert(res.message || "ไม่พบใบเสร็จนี้");
        }

        setLoading(false);
    };

    // 🔁 คืนสินค้าตาม receipt._id
    const handleRefund = async () => {
        if (!receipt?._id) {
            alert("กรุณาค้นหาใบเสร็จก่อนคืนสินค้า");
            return;
        }

        setLoading(true);
        const res = await refundByReceipt(receipt._id, reason);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="refund-page">
            <div className="refund-card">
                <h2 className="refund-header">
                    <FontAwesomeIcon icon={faRotateLeft} /> คืนสินค้า (Refund by Sale ID)
                </h2>

                {/* 🔍 ฟอร์มค้นหาใบเสร็จ */}
                <div className="refund-form">
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faFileInvoice} /> เลขการขาย (Sale ID)
                        </label>
                        <input
                            type="text"
                            value={saleId}
                            onChange={(e) => setSaleId(e.target.value)}
                            placeholder="เช่น 1760259866997"
                            className="input-field"
                        />
                    </div>

                    <button
                        className="btn-search"
                        onClick={handleSearchReceipt}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faSearch} />{" "}
                        {loading ? "กำลังค้นหา..." : "ค้นหาใบเสร็จ"}
                    </button>
                </div>

                {/* 🧾 แสดงข้อมูลใบเสร็จ */}
                {receipt && (
                    <div className="receipt-section fade-in">
                        <h3>🧾 ข้อมูลใบเสร็จต้นฉบับ</h3>
                        <div className="receipt-info">
                            <p>
                                <strong>พนักงาน:</strong> {receipt.employeeName}
                            </p>
                            <p>
                                <strong>วันที่ขาย:</strong>{" "}
                                {new Date(receipt.timestamp).toLocaleString()}
                            </p>
                            <p>
                                <strong>วิธีชำระเงิน:</strong> {receipt.paymentMethod}
                            </p>
                            <p>
                                <strong>ยอดรวม:</strong>{" "}
                                {receipt.totalPrice.toLocaleString()} บาท
                            </p>
                        </div>

                        <table className="receipt-table">
                            <thead>
                                <tr>
                                    <th>สินค้า</th>
                                    <th>ราคา</th>
                                    <th>จำนวน</th>
                                    <th>รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipt.items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td>{item.name}</td>
                                        <td>{item.price.toLocaleString()}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.subtotal.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="refund-reason">
                            <label>
                                <FontAwesomeIcon icon={faClipboardList} /> เหตุผลในการคืน
                                (ไม่บังคับ)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="เช่น สินค้าชำรุด / ลูกค้าเปลี่ยนใจ"
                            ></textarea>
                        </div>

                        <button
                            className="btn-refund"
                            onClick={handleRefund}
                            disabled={loading}
                        >
                            {loading ? "⏳ กำลังดำเนินการ..." : "ยืนยันคืนสินค้า"}
                        </button>
                    </div>
                )}

                {/* ✅ แสดงผลลัพธ์ */}
                {result && (
                    <div
                        className={`refund-result ${result.success ? "success" : "error"
                            } fade-in`}
                    >
                        {result.success ? (
                            <>
                                <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="result-icon success"
                                />
                                <h3>{result.message}</h3>
                                <div className="refund-details">
                                    <p>
                                        <strong>ใบเสร็จคืน:</strong>{" "}
                                        {result.data?.receipt?._id}
                                    </p>
                                    <p>
                                        <strong>ยอดคืน:</strong>{" "}
                                        {Math.abs(
                                            result.data?.receipt?.totalPrice || 0
                                        ).toLocaleString()}{" "}
                                        บาท
                                    </p>
                                    <p>
                                        <strong>วันที่คืน:</strong>{" "}
                                        {result.data?.receipt?.timestamp
                                            ? new Date(
                                                result.data.receipt.timestamp
                                            ).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="result-icon error"
                                />
                                <h3>{result.message}</h3>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefundPage;
