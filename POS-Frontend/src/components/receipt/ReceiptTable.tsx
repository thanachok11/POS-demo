import React from "react";
import { Receipt } from "../../types/receipt";

interface ReceiptTableProps {
    receipts: Receipt[];
    formatThaiDateTime: (date: string) => string;
    startIndex: number;
    onRowClick: (receipt: Receipt) => void;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({
    receipts,
    formatThaiDateTime,
    startIndex,
    onRowClick,
}) => {
    if (!receipts || receipts.length === 0) {
        return (
            <div className="receipt-empty">
                <p>😕 ไม่พบข้อมูลใบเสร็จ</p>
            </div>
        );
    }

    return (
        <div className="receipt-table-container">
            <table className="receipt-table">
                <thead>
                    <tr className="receipt-header-row">
                        <th className="receipt-header-cell">ลำดับ</th>
                        <th className="receipt-header-cell">วันที่</th>
                        <th className="receipt-header-cell">ประเภท</th>
                        <th className="receipt-header-cell">พนักงาน</th>
                        <th className="receipt-header-cell">ยอดรวม</th>
                        <th className="receipt-header-cell">วิธีชำระเงิน</th>
                    </tr>
                </thead>

                <tbody>
                    {receipts.map((receipt, index) => (
                        <tr
                            key={receipt._id}
                            className={`receipt-row clickable-row ${receipt.isReturn ? "row-return" : "row-sale"
                                }`}
                            onClick={() => onRowClick(receipt)}
                        >
                            <td className="receipt-cell index-cell">{startIndex + index + 1}</td>
                            <td className="receipt-cell">
                                {formatThaiDateTime(receipt.timestamp)}
                            </td>

                            {/* 🔁 ประเภทใบเสร็จ */}
                            <td
                                className={`receipt-type ${receipt.isReturn ? "return-type" : "sale-type"
                                    }`}
                            >
                                {receipt.isReturn ? "ใบคืนสินค้า 🔁" : "ใบขาย 🛒"}
                            </td>

                            <td className="receipt-cell">{receipt.employeeName}</td>
                            <td
                                className={`receipt-cell ${receipt.isReturn ? "negative" : ""
                                    }`}
                            >
                                {receipt.totalPrice.toLocaleString()} ฿
                            </td>
                            <td
                                className={`receipt-cell payment-${receipt.paymentMethod
                                    .replace(/\s+/g, "-")
                                    .toLowerCase()}`}
                            >
                                {receipt.paymentMethod}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReceiptTable;
