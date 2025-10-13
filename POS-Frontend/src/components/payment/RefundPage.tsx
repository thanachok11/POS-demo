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
    faMoneyBillWave,
    faCheckCircle,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const RefundPage: React.FC = () => {
    const [saleId, setSaleId] = useState("");
    const [reason, setReason] = useState("");
    const [refundMethod, setRefundMethod] = useState("เงินสด");
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<any>(null);
    const [result, setResult] = useState<any>(null);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);

    // 🔍 ค้นหาใบเสร็จ
    const handleSearchReceipt = async () => {
        if (!saleId.trim()) {
            alert("กรุณากรอกเลขการขาย");
            return;
        }

        setLoading(true);
        setReceipt(null);
        setResult(null);
        setSelectedItems([]);

        const res = await fetchReceiptBySaleId(saleId.trim());
        if (res.success && res.receipt) {
            setReceipt(res.receipt);
        } else {
            alert(res.message || "ไม่พบใบเสร็จนี้");
        }

        setLoading(false);
    };

    // ✅ toggle เลือก/ยกเลิกสินค้า
    const toggleItemSelection = (index: number) => {
        setSelectedItems((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    // 💰 คำนวณยอดรวมสินค้าที่เลือก
    const selectedTotal = receipt
        ? receipt.items
            .filter((_: any, i: number) => selectedItems.includes(i))
            .reduce((sum: number, item: any) => sum + item.subtotal, 0)
        : 0;

    // 🪄 เปิด popup ยืนยันคืนสินค้า
    const openConfirmPopup = () => {
        if (!receipt?._id) {
            alert("กรุณาค้นหาใบเสร็จก่อนคืนสินค้า");
            return;
        }
        if (selectedItems.length === 0) {
            alert("กรุณาเลือกรายการสินค้าที่ต้องการคืน");
            return;
        }
        setShowConfirm(true);
    };

    // 🔁 ดำเนินการคืนเงินจริง
    const handleRefund = async () => {
        try {
            setShowConfirm(false);
            setLoading(true);

            const selectedProducts = receipt.items.filter((_: any, i: number) =>
                selectedItems.includes(i)
            );

            const res = await refundByReceipt(
                receipt._id,
                reason,
                refundMethod,
                selectedProducts
            );
            setResult(res);
            setShowResultModal(true);
        } catch (err) {
            console.error("Refund error:", err);
            setResult({
                success: false,
                message: "❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
            });
            setShowResultModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="display">
            <div className="refund-container">
                <div className="refund-card">
                    <h2 className="refund-header">
                        <FontAwesomeIcon icon={faRotateLeft} /> คืนสินค้า (Partial Refund)
                    </h2>

                    {/* 🔍 ค้นหาใบเสร็จ */}
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
                        <div className="refund-section fade-in">
                            <h3>🧾 ข้อมูลใบเสร็จต้นฉบับ</h3>
                            <div className="refund-info">
                                <p><strong>พนักงาน:</strong> {receipt.employeeName}</p>
                                <p><strong>วันที่ขาย:</strong> {new Date(receipt.timestamp).toLocaleString("th-TH")}</p>
                                <p><strong>วิธีชำระเงิน:</strong> {receipt.paymentMethod}</p>
                                <p><strong>ยอดรวม:</strong> {receipt.totalPrice.toLocaleString()} บาท</p>
                            </div>

                            <table className="refund-table">
                                <thead>
                                    <tr>
                                        <th className="refund-herder-cell">เลือก</th>
                                        <th className="refund-herder-cell">สินค้า</th>
                                        <th className="refund-herder-cell">ราคา</th>
                                        <th className="refund-herder-cell">จำนวน</th>
                                        <th className="refund-herder-cell">รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipt.items.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="refund-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(i)}
                                                    onChange={() => toggleItemSelection(i)}
                                                />
                                            </td>
                                            <td className="refund-cell">{item.name}</td>
                                            <td className="refund-cell">{item.price.toLocaleString()}</td>
                                            <td className="refund-cell">{item.quantity}</td>
                                            <td className="refund-cell">{item.subtotal.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* ✅ แสดงยอดรวมของสินค้าที่เลือก */}
                            {selectedItems.length > 0 && (
                                <p className="refund-summary">
                                    💰 รวมยอดคืน:{" "}
                                    <strong>{selectedTotal.toLocaleString()} บาท</strong>
                                </p>
                            )}

                            {/* ✅ วิธีคืนเงิน */}
                            <div className="refund-method">
                                <label>
                                    <FontAwesomeIcon icon={faMoneyBillWave} /> วิธีคืนเงิน
                                </label>
                                <select
                                    value={refundMethod}
                                    onChange={(e) => setRefundMethod(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="เงินสด">💵 เงินสด</option>
                                    <option value="QR Code">📱 QR Code</option>
                                </select>
                            </div>

                            {/* ✏️ เหตุผลการคืน */}
                            <div className="refund-reason">
                                <label>
                                    <FontAwesomeIcon icon={faClipboardList} /> เหตุผลในการคืน
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="เช่น สินค้าชำรุด / ลูกค้าเปลี่ยนใจ"
                                ></textarea>
                            </div>

                            <button
                                className="btn-refund"
                                onClick={openConfirmPopup}
                                disabled={loading}
                            >
                                {loading ? "⏳ กำลังดำเนินการ..." : "ยืนยันคืนสินค้า"}
                            </button>
                        </div>
                    )}

                    {/* 🪄 Popup ยืนยันคืนเงิน */}
                    {showConfirm && (
                        <div className="confirm-overlay">
                            <div className="confirm-box fade-in">
                                <h3>ยืนยันการคืนสินค้า</h3>
                                <p>
                                    จะคืนสินค้า{" "}
                                    <strong>{selectedItems.length}</strong> รายการ<br />
                                    เป็นเงิน <strong>{selectedTotal.toLocaleString()} บาท</strong><br />
                                    ผ่านช่องทาง <strong>{refundMethod}</strong>
                                </p>
                                <div className="confirm-actions">
                                    <button
                                        className="btn-confirm"
                                        onClick={handleRefund}
                                        disabled={loading}
                                    >
                                        ✅ ยืนยัน
                                    </button>
                                    <button
                                        className="btn-cancel"
                                        onClick={() => setShowConfirm(false)}
                                    >
                                        ❌ ยกเลิก
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✅ Modal แสดงผลลัพธ์ */}
                    {showResultModal && result && (
                        <div className="confirm-overlay">
                            <div className={`result-modal fade-in ${result.success ? "success" : "error"}`}>
                                <FontAwesomeIcon
                                    icon={result.success ? faCheckCircle : faExclamationTriangle}
                                    className={`result-icon ${result.success ? "success" : "error"}`}
                                />
                                {result.success && result.data ? (
                                    <div className="modal-section">
                                        <h4>💰 รายการชำระเงินคืน</h4>
                                        <p><strong>รหัสการขาย:</strong> {result.data.refundPayment.saleId}</p>
                                        <p><strong>ประเภท:</strong> {result.data.refundPayment.type}</p>
                                        <p><strong>ช่องทาง:</strong> {result.data.refundPayment.paymentMethod}</p>
                                        <p><strong>จำนวน:</strong> {Math.abs(result.data.refundPayment.amount).toLocaleString()} บาท</p>
                                        <p><strong>สถานะ:</strong> {result.data.refundPayment.status}</p>
                                        <p><strong>วันที่:</strong> {new Date(result.data.refundPayment.createdAt).toLocaleString("th-TH")}</p>
                                    </div>
                                ) : (
                                    <div className="modal-section error-section">
                                        <p>{result.message || "คืนเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"}</p>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        className="btn-confirm"
                                        onClick={() => setShowResultModal(false)}
                                    >
                                        ✅ ปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefundPage;
