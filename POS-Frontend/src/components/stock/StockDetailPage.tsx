import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStockData } from "../../api/stock/stock.ts";
import { getProductByBarcode } from "../../api/product/productApi.ts";
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
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUser({
                    userId: decoded.userId,
                    role: decoded.role, // ✅ ตรงนี้แก้ให้ถูกต้อง
                    username: decoded.username,
                    email: decoded.email,

                });
                console.log("Decoded :", decoded);

            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);
    console.log("Current User:", user);
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
                // เรียก API สองตัวพร้อมกัน
                const [productData, stockData] = await Promise.all([
                    getProductByBarcode(barcode),
                    getStockData(token)
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
                    <p className="product-info-stockDetail"><strong>หมวดหมู่:</strong> {product.category}</p>
                    <p className="product-info-stockDetail"><strong>ราคา:</strong> {product.price} บาท</p>
                    <p className="product-info-stockDetail"><strong>สต็อกคงเหลือ:</strong> {stock?.quantity || "ไม่พบข้อมูล"}</p>

                    {/* ปุ่มนำเข้าสินค้าใหม่ และแก้ไขสินค้า */}
                    <div className="stock-detail-buttons">
                        <button 
                            className="back-button-stockDetail" 
                            onClick={() => navigate(-1)}>
                                ⬅️ กลับ
                        </button>
                        {user?.role !== "employee" && (
                        <button 
                            className="import-button-stockDetail" 
                            onClick={() => navigate(`/createOrder`)}
                        >
                            📥 นำเข้าสินค้าใหม่
                        </button>
                        )}
                        {user?.role !== "employee" && (
                        <button 
                            className="edit-button-stockDetail" 
                            onClick={() => navigate(`/edit/${barcode}`)}
                        >
                            ✏️ แก้ไขสินค้า
                        </button>
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
