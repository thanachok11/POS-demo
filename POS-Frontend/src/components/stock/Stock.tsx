import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationTriangle, faTimesCircle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetchStockData, } from "../../api/stock/stock.ts";
import { getProducts } from "../../api/product/productApi.ts";
import { Link } from "react-router-dom"; // เพิ่มการใช้งาน Link จาก react-router-dom
import "../../styles/stock/StockPage.css";

const StockPage: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stock, productList] = await Promise.all([
          fetchStockData(),
          getProducts()
        ]);

        setStockData(stock);
        setProducts(productList);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStockData = stockData.filter((item) => {
    const product = products.find((product) => product._id === item.productId);
    return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });



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

  const getProductDetails = (productId: string) => {
    return products.find((product) => product._id === productId);
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

  if (loading) return <div className="loading-text">Loading...</div>;
  if (error) return <div className="error-text">{error}</div>;

  return (
    <div className="stock-container">
      <h2 className="stock-header">📦 จัดการสต็อกสินค้า</h2>

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
        <button className="add-product-button"><FontAwesomeIcon icon={faPlus} className="icon-add" /></button>
      </Link>
      <table className="stock-table">
        <thead>
          <tr className="stock-header-row">
            <th className="stock-header-cell">ลำดับ</th>
            <th className="stock-header-cell">สินค้า</th>
            <th className="stock-header-cell">รูปภาพ</th>
            <th className="stock-header-cell">จำนวน</th>
            <th className="stock-header-cell">ซัพพลายเออร์</th>
            <th className="stock-header-cell">ที่เก็บ</th>
            <th className="stock-header-cell">สถานะ</th>
            <th className="stock-header-cell">เติมล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {filteredStockData.map((item, index) => {
            const product = getProductDetails(item.productId);
            return (
              <tr
                key={item.productId}
                className="stock-table-row"
                onClick={() => navigate(`/stock/${item.productId}`)} // นำทางไปยังหน้ารายละเอียด
                style={{ cursor: "pointer" }} // เปลี่ยนเป็น cursor pointer
              >
                <td className="stock-cell">{index + 1}</td>
                <td className="stock-cell">{product?.name || "ไม่พบสินค้า"}</td>
                <td className="stock-cell">
                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onClick={(e) => e.stopPropagation()} // ป้องกันคลิกภาพแล้วเกิดการนำทาง
                    />
                  ) : (
                    "ไม่มีรูป"
                  )}
                </td>
                <td className="stock-cell">{item.quantity}</td>
                <td className="stock-cell">{item.supplier}</td>
                <td className="stock-cell">{item.location}</td>
                <td className="stock-cell status-cell">
                  {getStatusIcon(item.status)} {item.status}
                </td>
                <td className="stock-cell">{formatDateTime(item.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockPage;
