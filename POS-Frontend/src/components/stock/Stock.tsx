import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationTriangle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { fetchStockData } from '../../api/stock/stock.ts'; // นำเข้าฟังก์ชันที่ดึงข้อมูลจาก API
import "../../styles/stock/StockPage.css";

interface StockItem {
  productId: string;
  name: string;
  quantity: number;
  supplier: string;
  location: string;
  threshold: number;
  status: string;
  lastRestocked: string;
}
const StockPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStockData(); // เรียกใช้งานฟังก์ชันที่ดึงข้อมูลจาก API
        setStockData(data);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // ดึงข้อมูลเมื่อ Component โหลดเสร็จ

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock":
        return <FontAwesomeIcon icon={faCheckCircle} className="icon-green" />;
      case "Low Stock":
        return <FontAwesomeIcon icon={faExclamationTriangle} className="icon-yellow" />;
      case "Out of Stock":
        return <FontAwesomeIcon icon={faTimesCircle} className="icon-red" />;
      default:
        return null;
    }
  };

  if (loading) return <div className="loading-text">Loading...</div>;
  if (error) return <div className="error-text">{error}</div>;

  return (
    <div className="stock-container">
      <h2 className="stock-header">📦 จัดการสต็อกสินค้า</h2>
      <table className="stock-table">
        <thead>
          <tr className="stock-header-row">
            <th className="stock-header-cell">#</th>
            <th className="stock-header-cell">สินค้า</th>
            <th className="stock-header-cell">จำนวน</th>
            <th className="stock-header-cell">ซัพพลายเออร์</th>
            <th className="stock-header-cell">ที่เก็บ</th>
            <th className="stock-header-cell">สถานะ</th>
            <th className="stock-header-cell">เติมล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {stockData.map((item, index) => (
            <tr key={item.productId} className="stock-table-row">
              <td className="stock-cell">{index + 1}</td>
              <td className="stock-cell">{item.name}</td>
              <td className="stock-cell">{item.quantity}</td>
              <td className="stock-cell">{item.supplier}</td>
              <td className="stock-cell">{item.location}</td>
              <td className="stock-cell status-cell">
                {getStatusIcon(item.status)} {item.status}
              </td>
              <td className="stock-cell">{item.lastRestocked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockPage;