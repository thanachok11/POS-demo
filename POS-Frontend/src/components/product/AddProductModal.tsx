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
    const [categories, setCategories] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        category: "",
        barcode: "",
    });

    const [stockData, setStockData] = useState({
        totalQuantity: 0,              // จำนวนสินค้า
        threshold: 5,             // สต็อกขั้นต่ำ
        costPrice: 0,             // ราคาทุน
        salePrice: 0,             // ราคาขาย
        lastPurchasePrice: 0,     // ราคาซื้อล่าสุด
        units: [] as { name: string; totalQuantity: number }[], // multi-unit conversion
        barcode: "",              // บาร์โค้ด
        batchNumber: "",          // เลขล็อตสินค้า
        expiryDate: "",           // วันหมดอายุ
        notes: "",                // หมายเหตุ
        isActive: true,           // ใช้งานอยู่หรือไม่
        supplierId: "",           // อ้างอิง Supplier
        supplierName: "",         // ชื่อ Supplier (เพื่อโชว์)
        location: "",             // คลังสินค้า
    });


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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

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
        } else if (name in stockData) {
            setStockData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
            }));
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

        // ตรวจว่ากรอกครบ
        if (
            !productData.name ||
            !productData.description ||
            !productData.category ||
            !image ||
            !stockData.totalQuantity ||
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

        // 🧩 1️⃣ เพิ่มข้อมูลสินค้า
        Object.entries(productData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        // 🧩 2️⃣ เพิ่มรูปภาพ (required)
        formData.append("image", image);

        // 🧩 3️⃣ เพิ่มข้อมูลสต็อก
        Object.entries(stockData).forEach(([key, value]) => {
            // serialize array
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            }
            // serialize object เช่น supplierId/location ที่เป็น Object
            else if (typeof value === "object" && value !== null) {
                if ((value as any)._id) {
                    formData.append(key, (value as any)._id);
                } else {
                    formData.append(key, JSON.stringify(value));
                }
            }
            // boolean → "true"/"false"
            else if (typeof value === "boolean") {
                formData.append(key, value ? "true" : "false");
            }
            // number/string
            else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        console.log("🧾 Payload ที่จะส่ง:", Object.fromEntries(formData.entries()));

        try {
            const response = await uploadProduct(formData, token);

            setShowSuccessPopup(true);
            if (response?.data) onSuccess(response.data);
        } catch (err) {
            console.error("❌ Upload error:", err);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };


    // เพิ่มหน่วยสินค้า
    const addUnit = () => {
        setStockData((prev) => ({
            ...prev,
            units: [...(prev.units || []), { name: "", totalQuantity: 1 }],
        }));
    };


    const removeUnit = (index: number) => {
        setStockData((prev) => ({
            ...prev,
            units: prev.units.filter((_, i) => i !== index),
        }));
    };

    const handleUnitChange = (index: number, field: "name" | "totalQuantity", value: any) => {
        const newUnits = [...stockData.units];
        newUnits[index] = { ...newUnits[index], [field]: value };
        setStockData({ ...stockData, units: newUnits });
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
                            <input type="text" name="name" value={productData.name} onChange={handleInputChange} className="add-product-form-input" required />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">รายละเอียด:</label>
                            <input type="text" name="description" value={productData.description} onChange={handleInputChange} className="add-product-form-input" required />
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
                                required
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
                                placeholder="ถ้าไม่มี barcode ระบบจะสร้างให้"
                            />
                        </div>
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">รูปภาพ:</label>
                            <input type="file" onChange={handleImageChange} className="add-product-form-input" accept="image/*" required />
                            {imagePreview && <img src={imagePreview} alt="preview" className="add-product-image-preview" />}
                        </div>
                    </div>
                    {/* คอลัมน์สต็อก */}
                    <div className="add-product-form-column">
                        <h3>สต็อกสินค้า</h3>

                        <div className="add-product-form-group">
                            <label className="add-product-form-label">จำนวน:</label>
                            <input
                                type="number"
                                name="totalQuantity"
                                value={stockData.totalQuantity}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                                min="0"
                                required
                            />
                        </div>

                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ราคาทุน (Cost Price):</label>
                            <input
                                type="number"
                                name="costPrice"
                                value={stockData.costPrice}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                                min="0"
                            />
                        </div>

                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ราคาขาย (Sale Price):</label>
                            <input
                                type="number"
                                name="salePrice"
                                value={stockData.salePrice}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                                min="0"
                            />
                        </div>

                        {/* Units (multi-unit conversion) */}
                        <div className="add-product-form-group">
                            <label className="add-product-form-label">หน่วยสินค้า (Units):</label>
                            {stockData.units?.map((u, index) => (
                                <div key={index} className="unit-row">
                                    <input
                                        type="text"
                                        placeholder="ชื่อหน่วย เช่น กล่อง"
                                        value={u.name}
                                        onChange={(e) => handleUnitChange(index, "name", e.target.value)}
                                        className="add-product-form-input small"
                                    />
                                    <input
                                        type="number"
                                        placeholder="จำนวน เช่น 12"
                                        value={u.totalQuantity}
                                        onChange={(e) =>
                                            handleUnitChange(index, "totalQuantity", Number(e.target.value))
                                        }
                                        className="add-product-form-input small"
                                        min="1"
                                    />
                                    <button type="button" onClick={() => removeUnit(index)} className="remove-unit-btn">
                                        ✖
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addUnit} className="add-unit-btn">
                                เพิ่มหน่วย
                            </button>
                        </div>

                        <div className="add-product-form-group">
                            <label className="add-product-form-label">ผู้จำหน่าย:</label>
                            <select
                                name="supplierId"
                                value={stockData.supplierId}
                                onChange={(e) => {
                                    const supplier = suppliers.find(s => s._id === e.target.value);
                                    setStockData({
                                        ...stockData,
                                        supplierId: e.target.value,
                                        supplierName: supplier?.companyName || "",
                                    });
                                }}
                                className="add-product-form-input"
                                required
                            >
                                <option value="">-- เลือกผู้จำหน่าย --</option>
                                {suppliers.map((s) => (
                                    <option key={s._id} value={s._id}>
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
                                required
                            >
                                <option value="">-- เลือกคลัง --</option>
                                {warehouses.map((w) => (
                                    <option key={w._id} value={w.name}>
                                        {w.name}
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
                                min="0"
                            />
                        </div>

                        <div className="add-product-form-group">
                            <label className="add-product-form-label">วันหมดอายุ:</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={stockData.expiryDate}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                            />
                        </div>

                        <div className="add-product-form-group">
                            <label className="add-product-form-label">บันทึกเพิ่มเติม:</label>
                            <textarea
                                name="notes"
                                value={stockData.notes}
                                onChange={handleInputChange}
                                className="add-product-form-input"
                                rows={3}
                                placeholder="รายละเอียดเพิ่มเติม เช่น วิธีจัดเก็บ"
                            />
                        </div>

                        <div className="add-product-form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={stockData.isActive}
                                    onChange={handleInputChange}
                                />
                                ใช้งานอยู่ (Active)
                            </label>
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
                                    onClose();
                                    navigate("/stocks");
                                }}
                                className="popup-close-btn"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                )}

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
