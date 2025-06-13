import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../api/product/orderApi.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faTimesCircle,
    faExclamationCircle,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
    getSupplierData,
    getProductsBySupplier,
} from "../../api/suppliers/supplierApi.ts";
import "../../styles/stock/CreateOrderPage.css";

const CreateOrderPage: React.FC = () => {
    const [supplierCompany, setSupplierCompany] = useState<string>("");
    const [items, setItems] = useState<{ productId: string; quantity: number }[]>(
        []
    );

    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [supplier, setSupplier] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [error, setError] = useState("");
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

    // เพิ่มสินค้าเข้า items
    const handleAddItem = () => {
        if (!productId) {
            setMessage("❌ กรุณาเลือกสินค้า");
            return;
        }
        if (quantity <= 0) {
            setMessage("❌ จำนวนสินค้าต้องมากกว่า 0");
            return;
        }
        // ถ้าสินค้าอยู่ในรายการแล้ว เพิ่มจำนวน
        const existingIndex = items.findIndex((item) => item.productId === productId);
        if (existingIndex !== -1) {
            const newItems = [...items];
            newItems[existingIndex].quantity += quantity;
            setItems(newItems);
        } else {
            setItems([...items, { productId, quantity }]);
        }
        setProductId("");
        setQuantity(1);
        setMessage("");
    };

    // ลบสินค้าออกจากรายการ items
    const handleRemoveItem = (productIdToRemove: string) => {
        setItems(items.filter((item) => item.productId !== productIdToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            setMessage("❌ กรุณาเพิ่มสินค้าก่อนสั่งซื้อ");
            return;
        }
        if (!location || location.trim() === "") {
            setMessage("❌ กรุณากรอกสถานที่จัดส่ง");
            return;
        }
        try {
            const orderData = {
                supplierCompany,
                supplierId: supplier,
                location,
                items,
            };
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            await createOrder(orderData, token);
            setShowSuccessPopup(true);
            setItems([]);
            setLocation("");
            setSupplier("");
            setSupplierCompany("");
            setMessage("");
        } catch (err) {
            setMessage("❌ เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ");
        }
    };

    const onClose = () => {
        setSupplier("");
        setProductId("");
        setQuantity(1);
        setMessage("");
        setShowSuccessPopup(false);
        setShowErrorPopup(false);
        navigate("/createOrder");
    };

    // แก้ไขการหา selectedProductData ให้ถูกต้อง
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
                        setItems([]); // ล้างรายการสินค้าเมื่อเปลี่ยน supplier
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
                <>
                    <div className="create-order-form-suppliers">
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

                        {/* ตารางรายละเอียดสินค้า */}
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

                        <button type="button" onClick={handleAddItem} className="add-item-btn">
                            ➕ เพิ่มสินค้า
                        </button>
                    </div>

                    {/* แสดงรายการสินค้าในออเดอร์ */}
                    <div className="order-items-list">
                        <h3 className="order-items-list-h" >รายการสินค้าในออเดอร์:</h3>
                        {items.length === 0 ? (
                            <p className="order-items-list-p">ยังไม่มีสินค้าในรายการ</p>
                        ) : (
                            <ul>
                                {items.map((item) => {
                                    const prod = products.find((p) => p.product._id === item.productId);
                                    return (
                                        <li key={item.productId} className="order-item">
                                            {prod ? prod.product.name : "ไม่พบสินค้า"} - จำนวน {item.quantity}
                                            <button
                                                onClick={() => handleRemoveItem(item.productId)}
                                                className="remove-item-btn"
                                                title="ลบสินค้า"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
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

                    <button className="submit-btn-suppliers" onClick={handleSubmit}>
                        ✅ ยืนยันการสั่งซื้อ
                    </button>
                </>
            )}

            {message && <p className="message-suppliers">{message}</p>}

            {/* Success Popup */}
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

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="order-popup-error">
                    <div className="order-popup-content">
                        <FontAwesomeIcon icon={faExclamationCircle} className="order-icon-error" />
                        <h3 className="order-popup-title">
                            {message || "เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ"}
                        </h3>

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
