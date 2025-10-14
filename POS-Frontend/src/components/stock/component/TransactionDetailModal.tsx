import React from "react";
import "../../../styles/stock/TransactionDetailModal.css";

interface User {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
}

interface Product {
    _id: string;
    name: string;
    barcode?: string;
}

interface Warehouse {
    _id: string;
    name: string;
    description?: string;
    location: string;
}

interface Stock {
    _id: string;
    location?: string | Warehouse;
    supplier?: string;
    barcode?: string;
    costPrice?: number;
    salePrice?: number;
    expiryDate?: string;
}

interface StockTransaction {
    _id: string;
    productId: Product;
    stockId: Stock;
    type: string;
    quantity: number;
    userId: User;
    notes?: string;
    createdAt: string;
}

interface Props {
    isOpen: boolean;
    transaction: StockTransaction | null;
    onClose: () => void;
    onSuccess?: (msg: string, success?: boolean) => void;
}

const TransactionDetailModal: React.FC<Props> = ({
    isOpen,
    transaction,
    onClose,
}) => {
    if (!isOpen || !transaction) return null;

    // ✅ Helper ดึงชื่อคลังเก็บ
    const getLocationName = (location?: string | Warehouse) => {
        if (!location) return "-";
        if (typeof location === "string") return location;
        return location.location;
    };

    // ✅ เปลี่ยนชื่อ label วันที่ ตามประเภทการทำรายการ
    const getDateLabel = (type: string): string => {
        switch (type.toUpperCase()) {
            case "SALE":
                return "วันที่ขายสินค้า";
            case "RESTOCK":
            case "PURCHASE":
                return "วันที่เติมสินค้า";
            case "REFUND":
            case "RETURN":
                return "วันที่รับคืนสินค้า";
            default:
                return "วันที่ทำรายการ";
        }
    };
    const getTypeLabel = (type: string) => {
        switch (type) {
            case "SALE": return "ขายสินค้า";
            case "RESTOCK": return "นำเข้าสินค้า";
            case "RETURN": return "รับคืนสินค้า";
            case "ADJUSTMENT": return "ปรับปรุงสต็อก";
            default: return type;
        }
    };
    return (
        <div className="tdm-overlay">
            <div className="tdm-modal">
                <div className="tdm-header">
                    <h2>📄 รายละเอียดการทำรายการ</h2>
                    <button className="tdm-close" onClick={onClose}>✖</button>
                </div>

                <div className="tdm-body">
                    <div className="tdm-row">
                        <p><strong>{getDateLabel(transaction.type)}:</strong></p>
                        <span>{new Date(transaction.createdAt).toLocaleString("th-TH")}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>สินค้า:</strong></p>
                        <span>{transaction.productId?.name}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>บาร์โค้ด:</strong></p>
                        <span>{transaction.productId?.barcode || transaction.stockId?.barcode || "-"}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>ประเภท:</strong></p>
                        <span className={`tdm-type ${transaction.type.toLowerCase()}`}>{getTypeLabel(transaction.type)}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>จำนวน:</strong></p>
                        <span>{transaction.quantity}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>ผู้ดำเนินการ:</strong></p>
                        <span>{transaction.userId?.username}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>ราคาทุน:</strong></p>
                        <span>{transaction.stockId?.costPrice ? `${transaction.stockId.costPrice.toLocaleString()} ฿` : "-"}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>ราคาขาย:</strong></p>
                        <span>{transaction.stockId?.salePrice ? `${transaction.stockId.salePrice.toLocaleString()} ฿` : "-"}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>ซัพพลายเออร์:</strong></p>
                        <span>{transaction.stockId?.supplier || "-"}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>สถานที่เก็บสินค้า:</strong></p>
                        <span>{getLocationName(transaction.stockId?.location)}</span>
                    </div>

                    <div className="tdm-row">
                        <p><strong>วันหมดอายุ:</strong></p>
                        <span>{transaction.stockId?.expiryDate || "-"}</span>
                    </div>

                    <div className="tdm-row tdm-full">
                        <p><strong>หมายเหตุ:</strong></p>
                        <span>{transaction.notes || "-"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
