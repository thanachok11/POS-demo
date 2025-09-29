import React from "react";
import "../../styles/stock/StockPage.css";

interface StockTableProps {
    stock: any[];
    getProductDetails: (barcode: string) => any;
    getLocationName: (id: string) => string;
    getCategoryNameById: (id: string) => string;
    formatThaiDateTime: (date: string) => string;
    getStatusIcon: (status: string) => string;
    handleRowClick: (barcode: string) => void;
}

const StockTable: React.FC<StockTableProps> = ({
    stock,
    getProductDetails,
    getLocationName,
    getCategoryNameById,
    formatThaiDateTime,
    getStatusIcon,
    handleRowClick,
}) => {
    return (
        <table className="stock-table">
            <thead>
                <tr className="stock-header-row">
                    <th className="stock-header-cell">ลำดับ</th>
                    <th className="stock-header-cell">สินค้า</th>
                    <th className="stock-header-cell">รูปภาพ</th>
                    <th className="stock-header-cell">ราคา</th>
                    <th className="stock-header-cell">จำนวน</th>
                    <th className="stock-header-cell">คลังสินค้า</th>
                    <th className="stock-header-cell">ซัพพลายเออร์</th>
                    <th className="stock-header-cell">สถานะ</th>
                    <th className="stock-header-cell">หมวดหมู่</th>
                    <th className="stock-header-cell">อัพเดทล่าสุด</th>
                </tr>
            </thead>
            <tbody>
                {stock.length > 0 ? (
                    stock.map((item, index) => {
                        const product = getProductDetails(item.barcode);
                        return (
                            <tr key={item.barcode} className="clickable-row" onClick={() => handleRowClick(item.barcode)}>
                                <td className="stock-cell">{index + 1}</td>
                                <td className="stock-cell">{product ? product.name : "ไม่พบสินค้า"}</td>
                                <td className="stock-cell">
                                    {product?.imageUrl ? <img src={product.imageUrl} className="product-image" /> : "ไม่มีรูป"}
                                </td>
                                <td className="stock-cell">{product?.price} บาท</td>
                                <td className="stock-cell">{item.quantity}</td>
                                <td className="stock-cell">{getLocationName(item.location)}</td>
                                <td className="stock-cell">{item.supplier}</td>
                                <td className="stock-cell status-cell">
                                    {getStatusIcon(item.status)} {item.status}
                                </td>
                                <td className="stock-cell">{getCategoryNameById(product?.category)}</td>
                                <td className="stock-cell">{formatThaiDateTime(item.updatedAt)}</td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={10} className="no-data">🔍 ไม่พบข้อมูลสินค้าในร้านของคุณ</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default StockTable;
