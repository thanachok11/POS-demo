import React, { useState, useEffect } from 'react';
import { uploadProduct } from "../../api/product/productApi.ts"; // Ensure this import is correct
import '../../styles/product/AddProductForm.css';

const AddProductForm = () => {
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
    location: '',
    threshold: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [addedProduct, setAddedProduct] = useState<any | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in productData) {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem("token");

    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.category ||
      !productData.barcode ||
      !image ||
      !stockData.quantity ||
      !stockData.supplier ||
      !stockData.location ||
      !stockData.threshold
    ) {
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
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
    formData.append('quantity', stockData.quantity);
    formData.append('supplier', stockData.supplier);
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
        location: '',
        threshold: '',
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
            <label className="form-label">หมวดหมู่:</label>
            <input
              type="text"
              name="category"
              value={productData.category}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">บาร์โค้ด:</label>
            <input
              type="text"
              name="barcode"
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
            <input
              type="text"
              name="supplier"
              value={stockData.supplier}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">ตำแหน่งจัดเก็บ:</label>
            <input
              type="text"
              name="location"
              value={stockData.location}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
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
      {message && <p className="error-message">{message}</p>}

      {showSuccessPopup && (
        <div className="success-popup">
          <span className="success-icon">✔️</span>
          <p>สินค้าเพิ่มสำเร็จ!</p>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
