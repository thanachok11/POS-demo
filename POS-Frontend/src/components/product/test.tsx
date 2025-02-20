import React, { useState, useEffect } from 'react';
import { uploadProduct } from "../../api/product/productApi.ts"; 
import { addStock } from '../../api/stock/stock.ts'; // นำเข้าฟังก์ชันที่ดึงข้อมูลจาก API
import '../../styles/product/AddProductForm.css';

const AddProductForm = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    barcode: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [addedProduct, setAddedProduct] = useState<any | null>(null); 
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); 
  const [stockData, setStockData] = useState({
    productId: '',
    quantity: 1,
    supplier: '',
    location: '',
  });

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStockData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem("token");  // ดึง token จาก localStorage

    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.category ||
      !productData.barcode ||
      !image ||
      !stockData.supplier ||
      !stockData.location
    ) {
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (!token) {
      setMessage('ไม่พบ token กรุณาเข้าสู่ระบบ');
      return;
    }

    setLoading(true);
    setMessage('');
    setAddedProduct(null);

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('category', productData.category);
    formData.append('barcode', productData.barcode);
    formData.append('image', image);

    try {
      // เพิ่มสินค้าใหม่
      const response = await uploadProduct(formData, token);  // ส่ง token ไปใน header ของ API
      setAddedProduct(response.data);

      // เพิ่มข้อมูลสต็อก
      const stockResponse = await addStock({
        productId: response.data._id, // ใช้ product ID จากที่เพิ่ม
        quantity: stockData.quantity,
        supplier: stockData.supplier,
        location: stockData.location,
      }, token); // ส่ง token ไปใน header ของ API

      setShowSuccessPopup(true);
      setProductData({
        name: '',
        description: '',
        price: '',
        category: '',
        barcode: '',
      });
      setStockData({
        productId: '',
        quantity: 1,
        supplier: '',
        location: '',
      });
      setImage(null);
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  return (
    <div className="add-product-container">
      <h2 className="form-title">เพิ่มสินค้าใหม่</h2>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">ชื่อสินค้า:</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleProductInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">รายละเอียดสินค้า:</label>
          <input
            type="text"
            name="description"
            value={productData.description}
            onChange={handleProductInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">ราคา:</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleProductInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">หมวดหมู่:</label>
          <input
            type="text"
            name="category"
            value={productData.category}
            onChange={handleProductInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">บาร์โค้ด:</label>
          <input
            type="text"
            name="barcode"
            value={productData.barcode}
            onChange={handleProductInputChange}
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
        </div>

        {/* ฟอร์มข้อมูลสต็อกสินค้า */}
        <h3>ข้อมูลสต็อกสินค้า</h3>
        <div className="form-group">
          <label className="form-label">ผู้จำหน่าย:</label>
          <input
            type="text"
            name="supplier"
            value={stockData.supplier}
            onChange={handleStockInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">ที่เก็บสินค้า:</label>
          <input
            type="text"
            name="location"
            value={stockData.location}
            onChange={handleStockInputChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">จำนวนสินค้า:</label>
          <input
            type="number"
            name="quantity"
            value={stockData.quantity}
            onChange={handleStockInputChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'กำลังอัปโหลด...' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>

      {message && <p className="error-message">{message}</p>}

      {showSuccessPopup && (
        <div className="success-popup">
          <span className="success-icon">✔️</span>
          <p>สินค้าและข้อมูลสต็อกเพิ่มสำเร็จ!</p>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
