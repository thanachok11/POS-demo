import React from "react";

interface Props {
    items: any[];
    qcStatus: string; // ✅ เพิ่ม qcStatus เข้ามา
}

const PurchaseOrderItemsTable: React.FC<Props> = ({ items, qcStatus }) => (
    <div className="po-items">
        <h4>📋 รายการสินค้า</h4>
        <table className="po-items-table">
            <thead>
                <tr>
                    <th>สินค้า</th>
                    <th>Barcode</th>
                    <th>จำนวน</th>
                    <th>ราคาต่อหน่วย (บาท)</th>
                    <th>ราคารวม</th>
                    <th>Batch</th>
                    <th>สถานะ QC</th>
                    <th>วันหมดอายุ</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => {
                    const total = item.costPrice * item.quantity;
                    return (
                        <tr key={index}>
                            <td>{item.productName}</td>
                            <td>{item.barcode || "-"}</td>
                            <td>{item.quantity}</td>
                            <td>{item.costPrice.toLocaleString()}</td>
                            <td className="po-total-cell">{total.toLocaleString()} ฿</td>
                            <td>{item.batchNumber || "-"}</td>
                            <td>
                                <span
                                    className={`qc-status ${qcStatus === "ผ่าน"
                                            ? "qc-pass"
                                            : qcStatus === "ไม่ผ่าน"
                                                ? "qc-fail"
                                                : qcStatus === "ตรวจบางส่วน" || qcStatus === "ผ่านบางส่วน"
                                                    ? "qc-partial"
                                                    : "qc-pending"
                                        }`}
                                >
                                    {qcStatus || "รอตรวจ"}
                                </span>
                            </td>
                            <td>
                                {item.expiryDate
                                    ? new Date(item.expiryDate).toLocaleDateString("th-TH")
                                    : "-"}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default PurchaseOrderItemsTable;
