import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStockData } from "../../api/stock/stock.ts";
import { getProductByBarcode } from "../../api/product/productApi.ts";
import { getCategories } from "../../api/product/categoryApi.ts"; // สมมุติว่าเรียก API หมวดหมู่
import "../../styles/stock/StockDetailPage.css";
import { jwtDecode } from "jwt-decode";

const StockDetail: React.FC = () => {
  const { barcode } = useParams<{ barcode: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ userId: string; username: string; role: string; email: string } | null>(null);

  const [categories, setCategories] = useState<any[]>([]); // state เก็บหมวดหมู่ทั้งหมด

  // decode token และ set user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          userId: decoded.userId,
          role: decoded.role,
          username: decoded.username,
          email: decoded.email,
        });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  // โหลด Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("❌ No token found for categories");
          return;
        }
        const response = await getCategories(token);
        if (response.success) {
          setCategories(response.data); // เก็บแค่ data ซึ่งเป็น array
        } else {
          setError("❌ ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
        }
      } catch (error) {
        console.error("Category Fetch Error:", error);
        setError("❌ ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
      }
    };
    fetchCategories();
  }, []);

  // โหลดข้อมูล product และ stock
  useEffect(() => {
    const fetchData = async () => {
      if (!barcode) {
        setError("❌ No barcode provided");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found");
        setLoading(false);
        return;
      }

      try {
        const [productData, stockData] = await Promise.all([
          getProductByBarcode(barcode),
          getStockData(token),
        ]);

        if (productData) {
          setProduct(productData);
          const stockItem = stockData?.find((item: any) => item.barcode === barcode);
          setStock(stockItem || { quantity: "ไม่พบข้อมูลสต็อก" });
        } else {
          setError("❌ ไม่พบสินค้าที่มีบาร์โค้ดนี้");
        }
      } catch (err) {
        setError("❌ เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barcode]);

  // ฟังก์ชันแปลง id หมวดหมู่เป็นชื่อหมวดหมู่
  const getCategoryNameById = (categoryId: string | undefined) => {
    if (!categoryId || !Array.isArray(categories)) return "ไม่ทราบหมวดหมู่";
    const category = categories.find(cat => String(cat._id) === categoryId);
    return category ? category.name : "ไม่ทราบหมวดหมู่";
  };

  if (loading) return <p className="loading-stockDetail">⏳ กำลังโหลด...</p>;
  if (error) return <p className="error-message-stockDetail">{error}</p>;

  return (
    <div className="stock-detail-container">
      <h2 className="stock-detail-header">📦 รายละเอียดสินค้า</h2>
      {product ? (
        <div className="stock-detail-card">
          <img src={product.imageUrl} alt={product.name} className="product-image-stockDetail" />
          <h3 className="product-name-stockDetail">{product.name}</h3>
          <p className="product-info-stockDetail"><strong>บาร์โค้ด:</strong> {product.barcode || "ไม่ระบุ"}</p>
          <p className="product-info-stockDetail"><strong>หมวดหมู่:</strong> {getCategoryNameById(product.category)}</p> {/* ใช้แปลง id */}
          <p className="product-info-stockDetail"><strong>ราคา:</strong> {product.price} บาท</p>
          <p className="product-info-stockDetail"><strong>สต็อกคงเหลือ:</strong> {stock?.quantity || "ไม่พบข้อมูล"}</p>

          <div className="stock-detail-buttons">
            <button className="back-button-stockDetail" onClick={() => navigate(-1)}>
              ⬅️ กลับ
            </button>
            {user?.role !== "employee" && (
              <>
                <button className="import-button-stockDetail" onClick={() => navigate(`/createOrder`)}>
                  📥 นำเข้าสินค้าใหม่
                </button>
                <button className="edit-button-stockDetail" onClick={() => navigate(`/edit/${barcode}`)}>
                  ✏️ ปรับสต็อกสินค้า
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="error-message-stockDetail">❌ ไม่พบข้อมูลสินค้าสำหรับบาร์โค้ดนี้</p>
      )}
    </div>
  );
};

export default StockDetail;
