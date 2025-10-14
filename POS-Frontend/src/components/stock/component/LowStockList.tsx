import React from "react";
import "../../../styles/stock/LowStockList.css";

interface StockItem {
    _id: string;
    barcode: string;
    totalQuantity: number;
    status: string;
    threshold: number;
    updatedAt: string;
    productId: {
        _id: string;
        name: string;
        imageUrl?: string;
    };
    expiryDate?: string;
}

interface Props {
    filteredStock: StockItem[];
}

const LowStockList: React.FC<Props> = ({ filteredStock }) => {
    const lowStockItems = filteredStock.filter(
        (item) =>
            item.status === "สินค้าเหลือน้อย" ||
            (item.totalQuantity <= item.threshold && item.totalQuantity > 0)
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "สินค้าพร้อมขาย":
                return "✅";
            case "สินค้าหมด":
                return "❌";
            case "สินค้าหมดอายุ":
                return "⏳";
            default:
                return "⚠️";
        }
    };

    return (
        <div className="lowstock-container">
            <h3 className="lowstock-title">⚠️ สินค้าเหลือน้อย</h3>

            {lowStockItems.length === 0 ? (
                <p className="no-items">🎉 ไม่มีสินค้าเหลือน้อย</p>
            ) : (
                <div className="lowstock-list">
                    {lowStockItems.map((item) => (
                        <div className="summary-item low" key={item._id}>
                            <div className="summary-item-left">
                                {item.productId.imageUrl ? (
                                    <img
                                        src={item.productId.imageUrl}
                                        alt={item.productId.name}
                                        className="summary-item-img"
                                    />
                                ) : (
                                    <div className="summary-item-placeholder">📦</div>
                                )}
                                <div>
                                    <label>
                                        {getStatusIcon(item.status)} {item.productId.name}
                                    </label>
                                    <p className="summary-item-barcode">Barcode: {item.barcode}</p>
                                </div>
                            </div>

                            <span className="summary-item-qty">
                                {item.totalQuantity} ชิ้น <small>(min {item.threshold})</small>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LowStockList;
