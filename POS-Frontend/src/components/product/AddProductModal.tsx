import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { uploadProduct } from "../../api/product/productApi";
import { getSupplierData } from "../../api/suppliers/supplierApi";
import { getWarehouses } from "../../api/product/warehousesApi";
import { getCategories } from "../../api/product/categoryApi";
import WarehouseModal from "./Warehouses";
import CategoryModal from "./CategoryModal";

import "../../styles/product/AddProductModal.css";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newProduct: any) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [suppliers, setSuppliers] = useState<{ companyName: string; _id: string }[]>([]);
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        barcode: "",
    });
    const [stockData, setStockData] = useState({
        quantity: "",
        supplier: "",
        supplierCompany: "",
        supplierId: "",
        location: "",
        threshold: "",
        customSupplier: "",
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errormessage, setErrorMessage] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        (async () => {
            try {
                const supplierList = await getSupplierData(token);
                if (Array.isArray(supplierList)) setSuppliers(supplierList);
                if (supplierList.data) setSuppliers(supplierList.data);
            } catch (e) {
                console.error("❌ Supplier fetch error", e);
            }

            try {
                const categoryList = await getCategories(token);
                if (categoryList.success) setCategories(categoryList.data);
            } catch (e) {
                console.error("❌ Category fetch error", e);
            }

            try {
                const warehouseList = await getWarehouses();
                if (Array.isArray(warehouseList)) setWarehouses(warehouseList);
            } catch (e) {
                console.error("❌ Warehouse fetch error", e);
            }
        })();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "supplierCompany") {
            const selected = suppliers.find((s) => s.companyName === value);
            setStockData((prev) => ({
                ...prev,
                supplierCompany: value,
                supplierId: selected?._id || "",
                supplier: value,
            }));
        } else if (name in productData) {
            setProductData((prev) => ({ ...prev, [name]: value }));
        } else {
            setStockData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        if (
            !productData.name ||
            !productData.description ||
            !productData.price ||
            !productData.category ||
            !image ||
            !stockData.quantity ||
            !stockData.supplierId ||
            !stockData.location ||
            !stockData.threshold
        ) {
            setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        const formData = new FormData();
        Object.entries(productData).forEach(([k, v]) => formData.append(k, v));
        formData.append("image", image);
        Object.entries(stockData).forEach(([k, v]) => formData.append(k, v));

        try {
            const response = await uploadProduct(formData, token);
            setShowSuccessPopup(true);

            // ✅ เรียก callback ส่งข้อมูล product ที่เพิ่มกลับไป
            if (response?.data) {
                onSuccess(response.data);
            }

        } catch (err) {
            console.error(err);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="add-product-modal-overlay">
            <div className="add-product-modal-content">
                <button className="add-product-modal-close" onClick={onClose}>
                    ✖
                </button>

                <h2 className="add-product-form-title">เพิ่มสินค้าใหม่</h2>
                <form className="add-product-form" onSubmit={handleSubmit}>
                    {/* คอลัมน์สินค้า */}
                    <div className="add-product-form-column">
                        <h3>สินค้า</h3>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ชื่อสินค้า:</label>
                            <input
                                type="text"
                                name="name"
                                value={productData.name}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">รายละเอียด:</label>
                            <input
                                type="text"
                                name="description"
                                value={productData.description}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ราคา:</label>
                            <input
                                type="number"
                                name="price"
                                value={productData.price}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">หมวดหมู่:</label>
                            <select
                                name="category"
                                value={productData.category}
                                onChange={(e) => {
                                    if (e.target.value === "custom") setShowCategoryModal(true);
                                    else setProductData({ ...productData, category: e.target.value });
                                }}
                                className="add-product-form-input"
                            >
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                                <option value="custom">➕ เพิ่มหมวดหมู่ใหม่</option>
                            </select>
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">บาร์โค้ด:</label>
                            <input
                                type="text"
                                name="barcode"
                                value={productData.barcode}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">รูปภาพ:</label>
                            <input type="file" onChange={handleImageChange} className="add-product-form-input" />
                            {imagePreview && (
                                <img src={imagePreview} alt="preview" className="add-product-image-preview" />
                            )}
                        </div>
                    </div>

                    {/* คอลัมน์สต็อก */}
                    <div className="add-product-form-column">
                        <h3>สต็อกสินค้า</h3>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">จำนวน:</label>
                            <input
                                type="number"
                                name="quantity"
                                value={stockData.quantity}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ผู้จำหน่าย:</label>
                            <select
                                name="supplierCompany"
                                value={stockData.supplierCompany}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            >
                                <option value="">-- เลือกผู้จำหน่าย --</option>
                                {suppliers.map((s, i) => (
                                    <option key={i} value={s.companyName}>
                                        {s.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">คลังจัดเก็บ:</label>
                            <select
                                name="location"
                                value={stockData.location}
                                onChange={(e) => {
                                    if (e.target.value === "custom") setShowWarehouseModal(true);
                                    else setStockData({ ...stockData, location: e.target.value });
                                }}
                                className="add-product-form-input"
                            >
                                <option value="">-- เลือกคลัง --</option>
                                {warehouses.map((w) => (
                                    <option key={w._id} value={w.location}>
                                        {w.location}
                                    </option>
                                ))}
                                <option value="custom">➕ เพิ่มคลังใหม่</option>
                            </select>
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ค่าขั้นต่ำสต็อก:</label>
                            <input
                                type="number"
                                name="threshold"
                                value={stockData.threshold}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>
                    </div>

                    <div className="add-product-form-actions">
                        <button type="submit" disabled={loading} className="add-product-submit-btn">
                            {loading ? "กำลังเพิ่มสินค้า..." : "เพิ่มสินค้า"}
                        </button>
                    </div>
                </form>

                {errormessage && <p className="add-product-error-message">{errormessage}</p>}

                {showSuccessPopup && (
                    <div className="product-popup">
                        <div className="product-popup-content">
                            <FontAwesomeIcon icon={faCheckCircle} className="product-icon" />
                            <h3 className="product-popup-title">เพิ่มสินค้าใหม่สำเร็จ!!</h3>

                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    onClose();       // ✅ ปิด modal
                                    navigate("/stocks"); // ✅ ไปหน้า stock
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
                    <div className="product-popup-error">
                        <div className="product-popup-content">

                            <FontAwesomeIcon icon={faExclamationCircle} className="product-icon-error" />
                            <h3 className="product-popup-title">{errormessage || "เกิดข้อผิดพลาดในการเพิ่มสินค้า"}</h3>

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

                {/* Modal ลูก */}
                <CategoryModal
                    isOpen={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    onSuccess={(newCat) => {
                        setCategories((prev) => [...prev, newCat]);
                        setProductData({ ...productData, category: newCat._id });
                    }}
                />
                <WarehouseModal
                    isOpen={showWarehouseModal}
                    onClose={() => setShowWarehouseModal(false)}
                    onSuccess={(newWh) => {
                        setWarehouses((prev) => [...prev, newWh]);
                        setStockData({ ...stockData, location: newWh.location });
                    }}
                />
            </div>
        </div>
    );
};

export default AddProductModal;
