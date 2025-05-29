import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { createOrder } from "../../api/product/productApi.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { getSupplierData, getProductsBySupplier } from "../../api/suppliers/supplierApi.ts";
import "../../styles/stock/CreateOrderPage.css";

const CreateOrderPage: React.FC = () => {
    const [supplierCompany, setSupplierCompany] = useState<string>("");

    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [supplier, setSupplier] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errormessage, seterrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    const [error, setError] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found");
                const data = await getSupplierData(token);
                setSuppliers(data);
                setLoading(false);
            } catch (err) {
                setError("❌ โหลดข้อมูล Supplier ไม่สำเร็จ");
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (!supplier) return;
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found");
                const res = await getProductsBySupplier(supplier, token);
                setProducts(res.data || []);
            } catch (err) {
                setError("❌ โหลดข้อมูลสินค้าของ Supplier ไม่สำเร็จ");
            }
        };
        fetchProducts();
    }, [supplier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newOrder = {
                supplierCompany,
                productId,
                quantity,
                supplier,
                location,
                supplierId: supplier,
            };            
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const res = await createOrder(newOrder, token); 
          
            setShowSuccessPopup(true);
        } catch (err) {
            setMessage("❌ เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ");
        }
    };
    const onClose = () => {
        // รีเซตค่าแบบฟอร์ม
        setSupplier(""); // รีเซตผู้จัดจำหน่าย
        setProductId("");  // รีเซตสินค้า
        setQuantity(1);          // รีเซตจำนวนสินค้า (ถ้ามี)
        setMessage("");          // ล้างข้อความแจ้งเตือน (ถ้ามี)

        // ปิด popup และนำทางกลับ
        setShowSuccessPopup(false);
        navigate("/createOrder");
    };


    // ✅ หาข้อมูล product+stock ที่ถูกเลือก
    const selectedProductData = products.find((p) => p.product._id === productId);

    return (
        <div className="create-order-container-suppliers">
            <h2 className="create-order-header-suppliers">สร้างใบสั่งซื้อสินค้า</h2>

            {loading && <p>⏳ กำลังโหลดข้อมูล...</p>}
            {error && <p className="error">{error}</p>}

            <div className="form-group-suppliers">
                <label>เลือก Supplier:</label>
                <select
                    value={supplier}
                    onChange={(e) => {
                        const selected = suppliers.find((s) => s._id === e.target.value);
                        setSupplier(e.target.value);
                        setSupplierCompany(selected?.companyName || "");
                    }}
                    required                    
                    >
                    <option value="">-- เลือก Supplier --</option>
                    {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.companyName}
                        </option>
                    ))}
                </select>
            </div>

            {supplier && (
                <form onSubmit={handleSubmit} className="create-order-form-suppliers">
                    <div className="form-group-suppliers">
                        <label>เลือกสินค้า:</label>
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            required
                        >
                            <option value="">-- เลือกสินค้า --</option>
                            {products.map((item) => (
                                <option key={item.product._id} value={item.product._id}>
                                    {item.product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ✅ ตารางรายละเอียดสินค้า */}
                    {selectedProductData && (
                        <div className="product-details-suppliers">
                            <h3>รายละเอียดสินค้า</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ชื่อสินค้า</th>
                                        <th>ราคา</th>
                                        <th>คำอธิบาย</th>
                                        <th>หมวดหมู่</th>
                                        <th>บาร์โค้ด</th>
                                        <th>จำนวนในคลัง</th>
                                        <th>สถานะ</th>
                                        <th>สถานที่จัดเก็บ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{selectedProductData.product.name}</td>
                                        <td>{selectedProductData.product.price}</td>
                                        <td>{selectedProductData.product.description}</td>
                                        <td>{selectedProductData.product.category}</td>
                                        <td>{selectedProductData.product.barcode}</td>
                                        <td>{selectedProductData.stock.quantity}</td>
                                        <td>{selectedProductData.stock.status}</td>
                                        <td>{selectedProductData.stock.location}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="form-group-suppliers">
                        <label className="form-label-suppliers">🔢 จำนวน:</label>
                        <input
                            type="number"
                            className="form-input-suppliers"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="form-group-suppliers">
                        <label>สถานที่จัดส่ง:</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <button className="submit-btn-suppliers" type="submit">
                        ✅ ยืนยันการสั่งซื้อ
                    </button>
                </form>
            )}

            {message && <p className="message-suppliers">{message}</p>}
            {/* ✅ Success Popup */}
            {showSuccessPopup && (
                <div className="order-popup">
                    <div className="order-popup-content">
                        <FontAwesomeIcon icon={faCheckCircle} className="order-icon" />
                        <h3 className="order-popup-title">✅ สร้างใบสั่งซื้อเรียบร้อย !!</h3>

                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                onClose();
                            }}
                            className="popup-close-btn"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ Error Popup */}
            {showErrorPopup && (
                <div className="order-popup-error">
                    <div className="order-popup-content">

                        <FontAwesomeIcon icon={faExclamationCircle} className="order-icon-error" />
                        <h3 className="order-popup-title">{message || "เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ"}</h3>

                        <button
                            onClick={() => {
                                setShowErrorPopup(false);
                                onClose();
                            }}
                            className="popup-close-btn"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
};

export default CreateOrderPage;
