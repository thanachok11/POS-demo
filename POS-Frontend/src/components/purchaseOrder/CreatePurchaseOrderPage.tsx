import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { getSupplierData, getProductsBySupplier } from "../../api/suppliers/supplierApi";
import { createPurchaseOrder } from "../../api/purchaseOrder/purchaseOrderApi";

import "../../styles/stock/CreateOrderPage.css";

const CreatePurchaseOrderPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [supplierId, setSupplierId] = useState<string>("");
    const [supplierCompany, setSupplierCompany] = useState<string>("");
    const [location, setLocation] = useState<string>("");

    const [items, setItems] = useState<any[]>([]);
    const [productId, setProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [costPrice, setCostPrice] = useState(0);
    const [batchNumber, setBatchNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const navigate = useNavigate();

    // โหลด suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const sup = await getSupplierData(token);
                setSuppliers(sup);
            } catch (err) {
                setMessage("❌ โหลด Supplier ไม่สำเร็จ");
                setShowErrorPopup(true);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    // โหลดสินค้าเฉพาะ Supplier + normalize data
    const fetchProductsBySupplierHandler = async (id: string) => {
        try {
            const token = localStorage.getItem("token") || "";
            const res = await getProductsBySupplier(id, token);

            const normalized = (res.data || []).map((item: any) => ({
                // product data
                _id: item.product._id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                barcode: item.product.barcode,
                imageUrl: item.product.imageUrl,
                category: item.product.category,
                supplierId: item.product.supplierId,
                isSelfPurchased: item.product.isSelfPurchased,
                createdAt: item.product.createdAt,
                updatedAt: item.product.updatedAt,

                // stock data
                stockId: item.stock?._id,
                quantity: item.stock?.quantity || 0,
                costPrice: item.stock?.costPrice || 0,
                salePrice: item.stock?.salePrice || item.product.price,
                status: item.stock?.status,
                expiryDate: item.stock?.expiryDate || "",
                threshold: item.stock?.threshold,
                lastRestocked: item.stock?.lastRestocked,
                location: item.stock?.location,
                isActive: item.stock?.isActive,
            }));

            setProducts(normalized);
        } catch (err) {
            setProducts([]);
            setMessage("❌ โหลดสินค้าของ Supplier ไม่สำเร็จ");
            setShowErrorPopup(true);
        }
    };

    // เพิ่มสินค้าเข้า items
    const handleAddItem = () => {
        if (!productId || !productName || quantity <= 0 || costPrice <= 0 || !batchNumber) {
            setMessage("❌ กรุณากรอกข้อมูลสินค้าให้ครบถ้วน");
            setShowErrorPopup(true);
            return;
        }

        setItems([
            ...items,
            {
                productId,
                productName,
                quantity,
                costPrice,
                total: quantity * costPrice,
                batchNumber,
                expiryDate,
            },
        ]);

        // reset state
        setProductId("");
        setProductName("");
        setQuantity(1);
        setCostPrice(0);
        setBatchNumber("");
        setExpiryDate("");
    };

    // ลบสินค้า
    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.productId !== id));
    };

    // Submit สร้าง PO
    const handleSubmit = async () => {
        if (!supplierId || !supplierCompany || !location || items.length === 0) {
            setMessage("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
            setShowErrorPopup(true);
            return;
        }

        try {
            const token = localStorage.getItem("token") || "";
            const purchaseOrderNumber = `PO-${new Date().getFullYear()}-${Date.now()}`;

            const res = await createPurchaseOrder(
                { purchaseOrderNumber, supplierId, supplierCompany, location, items },
                token
            );

            if (res.success) {
                setMessage("✅ สร้างใบสั่งซื้อเรียบร้อย");
                setShowSuccessPopup(true);
                setItems([]);
                setSupplierId("");
                setSupplierCompany("");
                setLocation("");
            } else {
                setMessage(res.message);
                setShowErrorPopup(true);
            }
        } catch (err) {
            setMessage("❌ เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ");
            setShowErrorPopup(true);
        }
    };

    if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;

    return (
        <div className="display">
            <div className="create-order-container-suppliers">
                <h2 className="create-order-header-suppliers">สร้างใบสั่งซื้อ (Purchase Order)</h2>

                {/* เลือก Supplier */}
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

                            if (id) {
                                fetchProductsBySupplierHandler(id);
                            }
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

                {/* ถ้ายังไม่เลือก Supplier */}
                {!supplierId ? (
                    <p style={{ marginTop: "20px", fontStyle: "italic" }}>
                        ⚠️ กรุณาเลือก Supplier ก่อน
                    </p>
                ) : (
                    <>
                        {/* เลือกสินค้า */}
                        <div className="form-group-suppliers">
                            <label>เลือกสินค้า:</label>
                            <select
                                value={productId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const selected = products.find((p: any) => p._id === id);
                                    if (selected) {
                                        setProductId(selected._id);
                                        setProductName(selected.name);
                                        setCostPrice(selected.costPrice || 0);
                                        setExpiryDate(
                                            selected.expiryDate
                                                ? selected.expiryDate.split("T")[0]
                                                : ""
                                        ); // auto-fill
                                    }
                                }}
                            >
                                <option value="">เลือกสินค้า</option>
                                {products.length > 0 ? (
                                    products.map((p: any) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} ({p.barcode}) - คงเหลือ {p.quantity}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>ไม่มีสินค้า</option>
                                )}
                            </select>
                        </div>

                        {/* รายละเอียดสินค้า */}
                        {productId && (
                            <>
                                <div className="form-group-suppliers">
                                    <label>จำนวน:</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        min={1}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>
                                <div className="form-group-suppliers">
                                    <label>ราคาต้นทุน:</label>
                                    <input
                                        type="number"
                                        value={costPrice}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group-suppliers">
                                    <label>Batch Number:</label>
                                    <input
                                        type="text"
                                        value={batchNumber}
                                        onChange={(e) => setBatchNumber(e.target.value)}
                                    />
                                </div>
                                <div className="form-group-suppliers">
                                    <label>วันหมดอายุ:</label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="add-item-btn"
                                    onClick={handleAddItem}
                                >
                                    ➕ เพิ่มสินค้า
                                </button>
                            </>
                        )}

                        {/* รายการสินค้า */}
                        <div className="order-items-list">
                            <h3>รายการสินค้าในใบสั่งซื้อ:</h3>
                            {items.length === 0 ? (
                                <p>ยังไม่มีสินค้า</p>
                            ) : (
                                <ul>
                                    {items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.productName} - {item.quantity} ชิ้น
                                            (ต้นทุน {item.costPrice} บาท)
                                            [Batch {item.batchNumber}]
                                            {item.expiryDate && (
                                                <span>
                                                    {" "}
                                                    🗓️ หมดอายุ:{" "}
                                                    {new Date(item.expiryDate).toLocaleDateString(
                                                        "th-TH"
                                                    )}
                                                </span>
                                            )}
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

                        {/* Location */}
                        <div className="form-group-suppliers">
                            <label>สถานที่รับสินค้า:</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {/* ปุ่มสร้าง PO */}
                        <button className="submit-btn" onClick={handleSubmit}>
                            ✅ สร้างใบสั่งซื้อ
                        </button>
                    </>
                )}

                {/* Popup */}
                {showSuccessPopup && (
                    <div className="order-popup">
                        <div className="order-popup-content">
                            <FontAwesomeIcon icon={faCheckCircle} className="order-icon" />
                            <h3>{message}</h3>
                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    navigate("/purchase-orders");
                                }}
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                )}
                {showErrorPopup && (
                    <div className="order-popup-error">
                        <div className="order-popup-content">
                            <FontAwesomeIcon
                                icon={faExclamationCircle}
                                className="order-icon-error"
                            />
                            <h3>{message}</h3>
                            <button onClick={() => setShowErrorPopup(false)}>ปิด</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePurchaseOrderPage;
