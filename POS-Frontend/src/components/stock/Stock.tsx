import React, { useState, useEffect } from "react";
import { getStockData } from "../../api/stock/stock.ts"; // ✅ นำเข้า API
import { getProducts } from "../../api/product/productApi.ts";
import { Link } from "react-router-dom"; // เพิ่มการใช้งาน Link จาก react-router-dom
import "../../styles/stock/StockPage.css"; // ✅ เพิ่มไฟล์สไตล์ (สร้างใหม่)

interface StockItem {
  barcode: string;
  name: string;
  imageUrl: string;
  quantity: number;
  updatedAt: string;
  location: string;
  status: string;
  supplier: string;
  category: string;
}

const StockPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<any[]>([]); // ใช้ any ชั่วคราว
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found");
        setLoading(false);
        return;
      }

      try {
        // ดึงข้อมูล stock
        const stock = await getStockData(token);
        setStockData(stock);

        // ดึงข้อมูลสินค้า
        const productData = await getProducts();  // เรียกใช้ฟังก์ชันจาก productApi.ts
        console.log("Product data: ", productData); // log ดูข้อมูลสินค้า

        if (productData.success && Array.isArray(productData.data)) {
          setProducts(productData.data);  // ใช้ productData.data แทน
        } else {
          setError("ไม่พบข้อมูลสินค้า");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันสำหรับการหาข้อมูลสินค้า
  const getProductDetails = (productId: string) => {
    return products.find((product) => product.productId === productId);
  };

  // ฟังก์ชันแปลงวันที่และเวลา
  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleString("th-TH", options);
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock":
        return "✅";
      case "Out of Stock":
        return "❌";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="stock-container">
      <h2 className="stock-header">📦 จัดการสต็อกสินค้า</h2>

      {loading && <p className="loading">⏳ Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {/* ช่องค้นหาสินค้า */}
      <div className="search-container">
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ปุ่มไปยังหน้าเพิ่มสินค้า */}
      <Link to="/add-product">
        <button className="add-product-button">เพิ่มสินค้า</button>
      </Link>
      {!loading && !error && (
        <table className="stock-table">
          <thead>
            <tr className="stock-header-row">
              <th className="stock-header-cell">ลำดับ</th>
              <th className="stock-header-cell">สินค้า</th>
              <th className="stock-header-cell">รูปภาพ</th>
              <th className="stock-header-cell">จำนวน</th>
              <th className="stock-header-cell">ที่เก็บ</th>
              <th className="stock-header-cell">ซัพพลายเออร์</th>
              <th className="stock-header-cell">สถานะ</th>
              <th className="stock-header-cell">ประเภทสินค้า</th>
              <th className="stock-header-cell">เติมล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {stockData.length > 0 ? (
              stockData.map((item, index) => {
                const product = getProductDetails(item.name);
                return (
                  <tr key={item.barcode}>
                    <td className="stock-cell">{index + 1}</td>
                    <td className="stock-cell">{product ? product.name : "ไม่พบสินค้า"}</td>
                    <td className="stock-cell">
                      {product && product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                      ) : (
                        "ไม่มีรูป"
                      )}
                    </td>
                    <td className="stock-cell">{item.quantity}</td>
                    <td className="stock-cell">{item.location}</td>
                    <td className="stock-cell">{item.supplier}</td>
                    <td className="stock-cell status-cell">
                      {getStatusIcon(item.status)} {item.status}
                    </td>
                    <td className="stock-cell">{product.category}</td>
                    <td className="stock-cell">{formatDateTime(item.updatedAt)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="no-data">🔍 ไม่พบข้อมูลสต็อกของคุณ</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockPage;
