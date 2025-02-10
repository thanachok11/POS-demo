import { useEffect, useState } from "react";
import { fetchStockData } from "../../api/stock/stock.ts";
import React from "react";

const ProductList = () => {
    const [stocks, setStocks] = useState<any[]>([]);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const stockData = await fetchStockData();
                setStocks(stockData);
            } catch (error) {
                console.error("โหลด Stock ไม่สำเร็จ", error);
            }
        };

        fetchStock();
    }, []);

    return (
        <div>
            <h2>รายการสินค้า</h2>
            <ul>
                {stocks.map((stock) => (
                    <li key={stock._id}>
                        <p>สินค้า: {stock.productId.name}</p>
                        <p>จำนวน: {stock.quantity} ชิ้น</p>
                        <p>สถานะ: {stock.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
