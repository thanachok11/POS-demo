import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faExclamationCircle,
    faTrashAlt,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { getSupplierData, getProductsBySupplier } from "../../api/suppliers/supplierApi";
import { createPurchaseOrder } from "../../api/purchaseOrder/purchaseOrderApi";
import { getWarehouseByProduct } from "../../api/purchaseOrder/purchaseOrderApi";

import "../../styles/stock/CreateOrderPage.css";

const CreatePurchaseOrderPage: React.FC = () => {
    const navigate = useNavigate();

    // ✅ States
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    const [supplierId, setSupplierId] = useState("");
    const [supplierCompany, setSupplierCompany] = useState("");

    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState<number>(1);
    const [costPrice, setCostPrice] = useState<number>(0);
    const [salePrice, setSalePrice] = useState<number>(0);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    const [warehouseId, setWarehouseId] = useState("");
    const [warehouseName, setWarehouseName] = useState(""); // ✅ ชื่อคลัง
    const [warehouseCode, setWarehouseCode] = useState(""); // ✅ รหัสคลัง

    /* ======================================================
       🔹 โหลด Supplier เริ่มต้น
    ====================================================== */
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const supRes = await getSupplierData(token);
                setSuppliers(supRes.data || supRes);
            } catch (err) {
                console.error("Load supplier error:", err);
                setMessage("❌ โหลด Supplier ไม่สำเร็จ");
                setShowErrorPopup(true);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    /* ======================================================
       🔹 โหลดสินค้าเฉพาะ Supplier
    ====================================================== */
    const fetchProductsBySupplierHandler = async (id: string) => {
        try {
            const token = localStorage.getItem("token") || "";
            const res = await getProductsBySupplier(id, token);

            const normalized = (res.data || []).map((item: any) => ({
                _id: item.product._id,
                name: item.product.name,
                barcode: item.product.barcode,
                description: item.product.description,
                costPrice: item.stock?.costPrice || 0,
                salePrice: item.stock?.salePrice || item.product.price || 0,
                totalQuantity: item.stock?.totalQuantity || 0,
                stockId: item.stock?._id || null,
            }));

            setProducts(normalized);
        } catch (err) {
            console.error("Load products error:", err);
            setProducts([]);
            setMessage("❌ โหลดสินค้าของ Supplier ไม่สำเร็จ");
            setShowErrorPopup(true);
        }
    };

    /* ======================================================
       🔹 ดึงคลังสินค้าของ Product โดยอัตโนมัติ
    ====================================================== */
    const fetchWarehouseByProduct = async (productId: string) => {
        try {
            const token = localStorage.getItem("token") || "";
            const data = await getWarehouseByProduct(productId, token);

            if (data.success && data.data?.location?._id) {
                setWarehouseId(data.data.location._id);
                setWarehouseName(data.data.location.name || "");
                setWarehouseCode(data.data.location.code || "");
                console.log("📦 warehouse ของสินค้านี้:", data.data.location.name);
            } else {
                setWarehouseId("");
                setWarehouseName("");
                setWarehouseCode("");
                console.warn("⚠️ ไม่พบคลังของสินค้านี้");
            }
        } catch (err) {
            console.error("❌ Fetch warehouse error:", err);
            setWarehouseId("");
            setWarehouseName("");
            setWarehouseCode("");
        }
    };

    /* ======================================================
       🔹 เพิ่มสินค้าในรายการ PO
    ====================================================== */
    const handleAddItem = () => {
        if (!productId || quantity <= 0 || costPrice <= 0) {
            setMessage("⚠️ กรุณาเลือกสินค้าและกรอกข้อมูลให้ครบ");
            setShowErrorPopup(true);
            return;
        }

        const selectedProduct = products.find((p) => p._id === productId);
        if (!selectedProduct) return;

        // 🔄 ป้องกันเพิ่มสินค้าซ้ำ
        const exists = items.find((i) => i.productId === productId);
        if (exists) {
            setMessage("⚠️ มีสินค้านี้ในรายการแล้ว");
            setShowErrorPopup(true);
            return;
        }

        const newItem = {
            productId,
            productName: selectedProduct.name,
            barcode: selectedProduct.barcode,
            quantity,
            costPrice,
            salePrice: salePrice || selectedProduct.salePrice,
            total: quantity * costPrice,
        };

        setItems((prev) => [...prev, newItem]);
        setProductId("");
        setQuantity(1);
        setCostPrice(0);
        setSalePrice(0);
    };

    /* ======================================================
       🔹 ลบสินค้าออกจากรายการ
    ====================================================== */
    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.productId !== id));
    };

    /* ======================================================
       🔹 สร้างใบสั่งซื้อ (POST)
    ====================================================== */
    const handleSubmit = async () => {
        if (!supplierId || items.length === 0) {
            setMessage("⚠️ กรุณาเลือก Supplier และเพิ่มสินค้าอย่างน้อย 1 รายการ");
            setShowErrorPopup(true);
            return;
        }

        try {
            const token = localStorage.getItem("token") || "";
            const purchaseOrderNumber = `PO-${new Date().getFullYear()}-${Date.now()}`;

            const payload = {
                purchaseOrderNumber,
                supplierId,
                supplierCompany,
                location: warehouseId, // ✅ ดึงอัตโนมัติจากสินค้า
                items: items.map((i) => ({
                    productId: i.productId,
                    productName: i.productName,
                    barcode: i.barcode,
                    quantity: Number(i.quantity),
                    costPrice: Number(i.costPrice),
                    salePrice: Number(i.salePrice),
                })),
            };

            const res = await createPurchaseOrder(payload, token);

            if (res.success) {
                setMessage("✅ สร้างใบสั่งซื้อสำเร็จ!");
                setShowSuccessPopup(true);
                setItems([]);
                setSupplierId("");
                setSupplierCompany("");
                setWarehouseId("");
            } else {
                throw new Error(res.message);
            }
        } catch (err: any) {
            console.error("Create PO error:", err);
            setMessage(err?.message || "❌ เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ");
            setShowErrorPopup(true);
        }
    };

    /* ======================================================
       🧱 Render
    ====================================================== */
    if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;

    return (
        <div className="create-order-container-suppliers">
            <h2 className="create-order-header-suppliers">🧾 สร้างใบสั่งซื้อ (Purchase Order)</h2>

            {/* Supplier Selector */}
            <div className="form-group-suppliers">
                <label>เลือก Supplier:</label>
                <select
                    value={supplierId}
                    onChange={(e) => {
                        const id = e.target.value;
                        const selected = suppliers.find((s) => s._id === id);
                        setSupplierId(id);
                        setSupplierCompany(selected?.companyName || "");
                        setItems([]);
                        setProducts([]);
                        if (id) fetchProductsBySupplierHandler(id);
                    }}
                >
                    <option value="">-- เลือก Supplier --</option>
                    {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.companyName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Products */}
            {supplierId ? (
                <>
                    <div className="form-group-suppliers">
                        <label>เลือกสินค้า:</label>
                        <select
                            value={productId}
                            onChange={(e) => {
                                const id = e.target.value;
                                const selected = products.find((p) => p._id === id);
                                if (selected) {
                                    setProductId(selected._id);
                                    setCostPrice(selected.costPrice);
                                    setSalePrice(selected.salePrice);
                                    fetchWarehouseByProduct(selected._id); // ✅ ดึงคลังของสินค้านั้น
                                }
                            }}
                        >
                            <option value="">-- เลือกสินค้า --</option>
                            {products.length > 0 ? (
                                products.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} ({p.barcode}) - คงเหลือ {p.totalQuantity} ชิ้น
                                    </option>
                                ))
                            ) : (
                                <option disabled>ไม่มีสินค้า</option>
                            )}
                        </select>
                    </div>

                    {productId && (
                        <>
                            <div className="form-inline-suppliers">
                                <div className="form-inline-item">
                                    <label>จำนวน:</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        min={1}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-inline-item">
                                    <label>ราคาทุน (บาท):</label>
                                    <input
                                        type="number"
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-inline-item">
                                    <button className="add-item-btn" onClick={handleAddItem}>
                                        <FontAwesomeIcon icon={faPlus} /> เพิ่มสินค้า
                                    </button>
                                </div>
                            </div>

                            {/* ✅ แสดงคลังที่ระบบดึงมา */}
                            {warehouseName && (
                                <div className="warehouse-display">
                                    <p style={{ marginTop: "10px", color: "#007bff" }}>
                                        📦 คลังสินค้าปัจจุบัน: <strong>{warehouseName}</strong> ({warehouseCode})
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                </>
            ) : (
                <p style={{ marginTop: "20px", fontStyle: "italic" }}>⚠️ กรุณาเลือก Supplier ก่อน</p>
            )}

            {/* Order Items List */}
            <div className="order-items-list">
                <h3>📦 รายการสินค้าในใบสั่งซื้อ</h3>
                {items.length === 0 ? (
                    <p>ยังไม่มีสินค้าในรายการ</p>
                ) : (
                    <ul>
                        {items.map((item, idx) => (
                            <li key={idx} className="order-item-row">
                                <span>
                                    {item.productName} — {item.quantity} ชิ้น (ต้นทุน {item.costPrice}฿)
                                </span>
                                <button
                                    className="remove-item-btn"
                                    onClick={() => handleRemoveItem(item.productId)}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Submit */}
            <button className="create-po-btn" onClick={handleSubmit}>
                ✅ สร้างใบสั่งซื้อ
            </button>

            {/* Popup Success */}
            {showSuccessPopup && (
                <div className="order-popup success">
                    <div className="order-popup-content">
                        <FontAwesomeIcon icon={faCheckCircle} className="order-icon" />
                        <h3>{message}</h3>
                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                navigate("/purchase-orders");
                            }}
                            className="popup-close-btn"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* Popup Error */}
            {showErrorPopup && (
                <div className="order-popup error">
                    <div className="order-popup-content">
                        <FontAwesomeIcon icon={faExclamationCircle} className="order-icon-error" />
                        <h3>{message}</h3>
                        <button
                            className="popup-close-btn"
                            onClick={() => setShowErrorPopup(false)}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePurchaseOrderPage;
