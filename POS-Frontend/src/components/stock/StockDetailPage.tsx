import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchStockData } from "../../api/stock/stock.ts";
import "../../styles/stock/StockDetailPage.css";

const StockDetailPage: React.FC = () => {
    const { id } = useParams(); // รับ productId จาก URL
    const [stockItem, setStockItem] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stockList = await fetchStockData();
                const foundItem = stockList.find((item) => item.productId === id);
                if (foundItem) {
                    setStockItem(foundItem);
                } else {
                    setError("ไม่พบสินค้าในสต็อก");
                }
            } catch (err) {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-text">{error}</div>;

    return (
        <div className="stock-detail-container">
            <h2>รายละเอียดสินค้า</h2>
            <p><strong>ชื่อสินค้า:</strong> {stockItem?.name}</p>
            <p><strong>จำนวน:</strong> {stockItem?.quantity}</p>
            <p><strong>ซัพพลายเออร์:</strong> {stockItem?.supplier}</p>
            <p><strong>ที่เก็บ:</strong> {stockItem?.location}</p>
            <p><strong>สถานะ:</strong> {stockItem?.status}</p>
            <p><strong>อัปเดตล่าสุด:</strong> {stockItem?.updatedAt}</p>
        </div>
    );
};

export default StockDetailPage;
