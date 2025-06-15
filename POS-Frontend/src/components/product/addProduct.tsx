import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { uploadProduct } from "../../api/product/productApi.ts"; // Ensure this import is correct
import { getSupplierData } from "../../api/suppliers/supplierApi.ts"; // Import your API function
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "../../api/product/warehousesApi.ts";
import { getCategories } from "../../api/product/categoryApi.ts"; // Import your API function
import WarehouseModal from '../product/Warehouses.tsx';
import CategoryModal from './CategoryModal.tsx';

import '../../styles/product/AddProductForm.css';

const AddProductForm = () => {
  const [suppliers, setSuppliers] = useState<{ companyName: string; _id: string }[]>([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    barcode: '',
  });
  const [stockData, setStockData] = useState({
    quantity: '',
    supplier: '',
    supplierCompany: '',
    supplierId: '',
    location: '',
    threshold: '',
    customSupplier: '', // For custom supplier input

  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errormessage, seterrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [message, setMessage] = useState('');
  const [addedProduct, setAddedProduct] = useState<any | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [Warehouses, setGetWarehouses] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWarehouses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found for warehouse");
        return;
      }

      try {
        const warehouseList = await getWarehouses();
        console.log("📦 Warehouse Data:", warehouseList);
        setGetWarehouses(warehouseList); // สมมุติว่าข้อมูลเป็น array
      } catch (error) {
        setError("❌ ไม่สามารถโหลดข้อมูลคลังสินค้าได้");
        console.error("Warehouse Fetch Error:", error);
      }
    };

    fetchWarehouses();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found for categories");
        return;
      }

      try {
        const categoryList = await getCategories(token);
        if (categoryList.success && Array.isArray(categoryList.data)) {
          setCategories(categoryList.data);
        } else {
          setError("❌ ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
        }

        console.log("📦 Category Data:", categoryList);
      } catch (error) {
        setError("❌ ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
        console.error("Category Fetch Error:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ No token found");
        return;
      }

      setLoading(true);
      try {
        const response = await getSupplierData(token);
        console.log("📌 API Response:", response);

        if (Array.isArray(response)) {
          setSuppliers(response); // Directly set suppliers if the response is an array
        } else if (response.data && Array.isArray(response.data)) {
          setSuppliers(response.data); // Set suppliers from response data
        } else {
          setError("❌ รูปแบบข้อมูลไม่ถูกต้อง");
        }
      } catch (error) {
        setError("❌ ไม่สามารถดึงข้อมูลซัพพลายเออร์ได้");
        console.error("API Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "supplierCompany") {
      const selectedSupplier = suppliers.find(s => s.companyName === value); // ✅ ประกาศใน scope นี้
      setStockData((prevData) => ({
        ...prevData,
        supplierCompany: value,
        supplierId: selectedSupplier?._id || '', // ✅ ใช้ได้เลย
        supplier: value,
        customSupplier: value === "custom" ? prevData.customSupplier : "",
      }));
    } else if (name in productData) {
      setProductData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setStockData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };


  // const handleCustomSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setStockData((prevData) => ({
  //     ...prevData,
  //     customSupplier: e.target.value,
  //   }));
  // };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Inside JSX render
  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem("token");

    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.category ||
      !image ||
      !stockData.quantity ||
      !stockData.supplier ||
      !stockData.supplierId ||
      !stockData.location ||
      !stockData.threshold
    ) {
      seterrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    seterrorMessage('');
    setAddedProduct(null);

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('category', productData.category);
    formData.append('barcode', productData.barcode);
    formData.append('image', image);
    formData.append('quantity', stockData.quantity);
    formData.append('supplierId', stockData.supplierId);
    formData.append('location', stockData.location);
    formData.append('threshold', stockData.threshold);


    try {
      const response = await uploadProduct(formData, token);
      setAddedProduct(response.data);
      setShowSuccessPopup(true);

      setProductData({
        name: '',
        description: '',
        price: '',
        category: '',
        barcode: '',
      });
      setStockData({
        quantity: '',
        supplier: '',
        supplierId: '',
        supplierCompany: '',
        location: '',
        threshold: '',
        customSupplier: '', // For custom supplier input

      });
      setImage(null);
    } catch (error) {
      setShowErrorPopup(true)
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const onClose = () => {
    navigate("/stocks");

    setShowSuccessPopup(false); // ปิด modal หลัก
  };


  return (
    <div className="add-product-container">
      <h2 className="form-title">เพิ่มสินค้าใหม่</h2>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-column">
          <h3>สินค้า</h3>
          <div className="form-group">
            <label className="form-label">ชื่อสินค้า:</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียดสินค้า:</label>
            <input
              type="text"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">ราคา:</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">หมวดหมู่สินค้า:</label>
            <select
              name="category"
              value={productData.category}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setShowCategoryModal(true); // เปิด modal
                } else {
                  setProductData({ ...productData, category: value }); // ✅ เก็บ _id ไม่ใช่ name
                }
              }}
              className="form-input"
            >
              <option value="">-- เลือกหมวดหมู่สินค้า --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
              <option value="custom">➕ เพิ่มหมวดหมู่ใหม่</option>
            </select>

          </div>

          {/* 🧩 Modal สำหรับเพิ่มหมวดหมู่ */}
          <CategoryModal
            isOpen={showCategoryModal}
            onClose={() => setShowCategoryModal(false)}
            onSuccess={(newCategory) => {
              setCategories((prev) => [...prev, newCategory]);
              setProductData({ ...productData, category: newCategory._id }); // ✅ ต้องใช้ _id
            }}
          />


          <div className="form-group">
            <label className="form-label">บาร์โค้ด:</label>
            <input
              type="text"
              name="barcode"
              placeholder='สร้างบาร์โค้ดอัตโนมัติหากไม่กรอก'
              value={productData.barcode}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">เลือกรูปภาพสินค้า:</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="form-file-input"
            />
            {imagePreview && <img src={imagePreview} alt="Product Preview" className="image-preview" />}

          </div>
          <div className="form-group">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'กำลังเพิ่มสินค้า...' : 'เพิ่มสินค้า'}
            </button>
          </div>
        </div>

        <div className="form-column">
          <h3>สต็อกสินค้า</h3>
          <div className="form-group">
            <label className="form-label">จำนวนสินค้า:</label>
            <input
              type="number"
              name="quantity"
              value={stockData.quantity}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">ผู้จำหน่าย:</label>
            <select
              name="supplierCompany"
              value={stockData.supplierCompany}
              onChange={handleInputChange}
              className="form-input"
            >

              <option value="">-- เลือกผู้จำหน่าย --</option>
              {suppliers.map((supplier, index) => (
                <option key={index} value={supplier.companyName}>
                  {supplier.companyName}
                </option>
              ))}
              
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">ตำแหน่งจัดเก็บ:</label>
            <select
              name="location"
              value={stockData.location}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setShowModal(true); // เปิด Modal
                } else {
                  setStockData({ ...stockData, location: value });
                }
              }}
              className="form-input"
            >
              <option value="">-- เลือกคลังจัดเก็บสินค้า --</option>
              {Warehouses?.map((wh: any) => (
                <option key={wh._id} value={wh.location}>
                  {wh.location}
                </option>
              ))}
              <option value="custom">➕ เพิ่มคลังจัดเก็บสินค้าใหม่</option>
            </select>
          </div>

          {/* 🧩 Modal อยู่ด้านนอก */}
          <WarehouseModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={(newWarehouse) => {
              // โหลดใหม่หรือเพิ่มเข้า state
              setGetWarehouses((prev: any[]) => [...(prev || []), newWarehouse]);
              setStockData({ ...stockData, location: newWarehouse.location });
            }}
          />



          <div className="form-group">
            <label className="form-label">ค่าขั้นต่ำสต็อก:</label>
            <input
              type="number"
              name="threshold"
              value={stockData.threshold}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

        </div>

      </form>
      {errormessage && <p className="error-message">{errormessage}</p>}

      {/* ✅ Success Popup */}
      {showSuccessPopup && (
        <div className="product-popup">
          <div className="product-popup-content">
            <FontAwesomeIcon icon={faCheckCircle} className="product-icon" />
            <h3 className="product-popup-title">เพิ่มสินค้าใหม่สำเร็จ!!</h3>

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
        <div className="product-popup-error">
          <div className="product-popup-content">

            <FontAwesomeIcon icon={faExclamationCircle} className="product-icon-error" />
            <h3 className="product-popup-title">{message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า"}</h3>

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

export default AddProductForm;
