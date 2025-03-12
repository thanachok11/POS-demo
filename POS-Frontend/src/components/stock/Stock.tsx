import React, { useState, useEffect } from "react";
import { getStockData } from "../../api/stock/stock.ts";
import { getProducts } from "../../api/product/productApi.ts";
import { Link, useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
import "../../styles/stock/StockPage.css";
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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const navigate = useNavigate(); // ใช้สำหรับเปลี่ยนหน้า

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found");
        setLoading(false);
        return;
      }

      try {
        const stock = await getStockData(token);
        setStockData(stock);

        const productData = await getProducts();
        if (productData.success && Array.isArray(productData.data)) {
          setProducts(productData.data);
          console.log(productData.data);
        } else {
          setError("ไม่พบข้อมูลสินค้า");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProductDetails = (barcode: string) => {
    return products.find((product) => product.barcode === barcode);
  };

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
      case "สินค้าพร้อมขาย":
        return "✅";
      case "สินค้าหมด":
        return "❌";
      default:
        return "⚠️";
    }
  };

  const filteredStock = stockData.filter((item) => {
    const product = getProductDetails(item.barcode);
    const searchText = searchQuery.toLowerCase();

    return (
      product?.name?.toLowerCase().includes(searchText) ||
      product?.category?.toLowerCase().includes(searchText) ||
      item.supplier?.toLowerCase().includes(searchText) ||
      item.barcode.includes(searchText)
    );
  });

  // ฟังก์ชันเมื่อคลิกที่แถว
  const handleRowClick = (barcode: string) => {
    navigate(`/products/barcode/${barcode}`); // ไปยังหน้ารายละเอียดสินค้า
  };

  return (
    <div className="stock-container">
      <h2 className="stock-header">📦 จัดการสต็อกสินค้า</h2>

      {loading && <p className="loadingStock">⏳ Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="search-container">
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Link to="/add-product">
        <button className="add-product-button">➕ เพิ่มสินค้า</button>
      </Link>

      {!loading && !error && (
        <table className="stock-table">
          <thead>
            <tr className="stock-header-row">
              <th className="stock-header-cell">ลำดับ</th>
              <th className="stock-header-cell">สินค้า</th>
              <th className="stock-header-cell">รูปภาพ</th>
              <th className="stock-header-cell">ราคา</th>
              <th className="stock-header-cell">จำนวน</th>
              <th className="stock-header-cell">ที่เก็บ</th>
              <th className="stock-header-cell">ซัพพลายเออร์</th>
              <th className="stock-header-cell">สถานะ</th>
              <th className="stock-header-cell">หมวดหมู่</th>
              <th className="stock-header-cell">อัพเดทล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length > 0 ? (
              filteredStock.map((item, index) => {
                const product = getProductDetails(item.barcode);
                return (
                  <tr
                    key={item.barcode}
                    className="clickable-row"
                    onClick={() => handleRowClick(item.barcode)} // กดแล้วไปหน้ารายละเอียด
                  >
                    <td className="stock-cell">{index + 1}</td>
                    <td className="stock-cell">{product ? product.name : "ไม่พบสินค้า"}</td>
                    <td className="stock-cell">
                      {product && product.imageUrl ? (
                        <img src={product.imageUrl} className="product-image" />
                      ) : (
                        "ไม่มีรูป"
                      )}
                    </td>
                    <td className="stock-cell">{product?.price} บาท</td>
                    <td className="stock-cell">{item.quantity}</td>
                    <td className="stock-cell">{item.location}</td>
                    <td className="stock-cell">{item.supplier}</td>
                    <td className="stock-cell status-cell">
                      {getStatusIcon(item.status)} {item.status}
                    </td>
                    <td className="stock-cell">{product?.category}</td>
                    <td className="stock-cell">{formatDateTime(item.updatedAt)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="no-data">🔍 ไม่พบข้อมูลสินค้า</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockPage;
