import React from "react";

interface Props {
    items: any[];
    stockLots: any[]; // ✅ รับ array ของ lot เข้ามาด้วย
}

const PurchaseOrderItemsTable: React.FC<Props> = ({ items, stockLots }) => {
    const getQCStatus = (batchNumber: string) => {
        const lot = stockLots.find((lot) => lot.batchNumber === batchNumber);
        return lot?.qcStatus || "รอตรวจสอบ";
    };

    const getQCClass = (status: string) => {
        switch (status) {
            case "ผ่าน":
                return "qc-pass";
            case "ไม่ผ่าน":
                return "qc-fail";
            case "ตรวจบางส่วน":
            case "ผ่านบางส่วน":
                return "qc-partial";
            default:
                return "qc-pending";
        }
    };

    return (
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
                        const qcStatus = getQCStatus(item.batchNumber);
                        const qcClass = getQCClass(qcStatus);

                        return (
                            <tr key={index}>
                                <td>{item.productName}</td>
                                <td>{item.barcode || "-"}</td>
                                <td>{item.quantity}</td>
                                <td>{item.costPrice.toLocaleString()}</td>
                                <td className="po-total-cell">{total.toLocaleString()} ฿</td>
                                <td>{item.batchNumber || "-"}</td>
                                <td>
                                    <span className={`qc-status ${getQCClass(getQCStatus(item.batchNumber))}`}>
                                        {getQCStatus(item.batchNumber)}
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
};

export default PurchaseOrderItemsTable;
