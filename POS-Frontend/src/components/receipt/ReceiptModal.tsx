import React from "react";
import "../../styles/receipt/ReceiptDetail.css";
import { Receipt } from "../../types/receipt";

interface ReceiptModalProps {
    receipt: Receipt;
    onClose: () => void;
}

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

const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
    const handlePrint = () => window.print();

    const payment =
        typeof receipt.paymentId === "object" && receipt.paymentId !== null
            ? receipt.paymentId
            : null;

    const discount = receipt.discount ?? 0;
    const subtotal = receipt.totalPrice / 1.07; // สมมติว่าราคารวม VAT แล้ว
    const vat = subtotal * 0.07;
    const netTotal = receipt.totalPrice - discount;

    return (
        <div className="receipt-modal-overlay">
            <div className="receipt-modal-content">
                <div className="receipt-modal-paper receipt-print-area">
                    {/* 🏪 Header */}
                    <div className="receipt-modal-header">
                        <h2 className="receipt-store-name">EazyPOS Store</h2>
                        <p className="receipt-store-branch">สาขา ศรีเจริญ</p>
                        <p className="receipt-store-contact">โทร. 063-313-3099</p>
                        <hr className="receipt-separator" />
                    </div>

                    {/* 📜 ข้อมูลใบเสร็จ */}
                    <div className="receipt-info">
                        {payment?.saleId && (
                            <p>
                                <strong>รหัสการขาย:</strong> {payment.saleId}
                            </p>
                        )}
                        <p>
                            <strong>วันที่ออกใบเสร็จ:</strong>{" "}
                            {formatThaiDateTime(payment?.createdAt ?? receipt.timestamp)}
                        </p>
                        <p>
                            <strong>พนักงาน:</strong> {receipt.employeeName ?? "ไม่ระบุ"}
                        </p>
                        <p>
                            <strong>วิธีชำระเงิน:</strong>{" "}
                            {payment?.paymentMethod ?? receipt.paymentMethod}
                        </p>
                    </div>

                    <hr className="receipt-separator" />

                    {/* 🛒 รายการสินค้า (ไม่มี thead) */}
                    <div className="receipt-items-list">
                        {receipt.items.map((item) => (
                            <div key={item._id} className="receipt-item-row">
                                <span className="receipt-item-name">
                                    {item.totalQuantity} * {item.name}
                                </span>
                                <span className="receipt-item-total">
                                    {item.subtotal.toLocaleString()} ฿
                                </span>
                            </div>
                        ))}
                    </div>

                    <hr className="receipt-separator" />

                    {/* 💰 สรุปยอด */}
                    <div className="receipt-summary">
                        <p>
                            <span>ยอดก่อนภาษี</span>
                            <strong>
                                {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                            </strong>
                        </p>
                        <p>
                            <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                            <strong>
                                {vat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                            </strong>
                        </p>
                        {discount > 0 && (
                            <p>
                                <span>ส่วนลด</span>
                                <strong>-{discount.toLocaleString()} ฿</strong>
                            </p>
                        )}
                        <p className="receipt-total">
                            <span>ยอดสุทธิ</span>
                            <strong>
                                {netTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                            </strong>
                        </p>
                        <hr />
                        <p>
                            <span>จำนวนเงินที่จ่าย</span>
                            <strong>{receipt.amountPaid.toLocaleString()} ฿</strong>
                        </p>
                        <p>
                            <span>เงินทอน</span>
                            <strong>{receipt.changeAmount.toLocaleString()} ฿</strong>
                        </p>
                    </div>

                    {/* 🙏 Footer */}
                    <div className="receipt-footer">
                        <p>🙏 ขอบคุณที่ใช้บริการ 🙏</p>
                        {payment?.status === "สำเร็จ" && (
                            <p style={{ fontSize: "11px", marginTop: "5px" }}>
                                (เอกสารนี้ออกโดยระบบ EazyPOS)
                            </p>
                        )}
                    </div>
                </div>

                {/* 🔘 ปุ่ม */}
                <div className="receipt-modal-actions">
                    <button className="receipt-btn-print" onClick={handlePrint}>
                        🖨️ พิมพ์ใบเสร็จ
                    </button>
                    <button className="receipt-btn-close" onClick={onClose}>
                        ✖ ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
