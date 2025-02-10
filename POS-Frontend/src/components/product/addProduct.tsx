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
    stock: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [addedProduct, setAddedProduct] = useState<any | null>(null); // Store added product data
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // To control success popup visibility

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
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
    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.category ||
      !productData.barcode ||
      !productData.stock ||
      !image
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
    formData.append('stock', productData.stock);
    formData.append('image', image);

    try {
      const response = await uploadProduct(formData); // Call the uploadProduct function
      setAddedProduct(response.data); // Store the added product data
      setShowSuccessPopup(true); // Show the success popup
      setProductData({
        name: '',
        description: '',
        price: '',
        category: '',
        barcode: '',
        stock: '',
      });
      setImage(null);
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Hide success popup after 3 seconds
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
          <label className="form-label">จำนวน:</label>
          <input
            type="number"
            name="stock"
            value={productData.stock}
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
            {loading ? 'กำลังอัปโหลด...' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
      {message && <p className="error-message">{message}</p>}

      {showSuccessPopup && (
        <div className="success-popup">
          <span className="success-icon">✔️</span>
          <p>สินค้าเพิ่มสำเร็จ!</p>
        </div>
      )}

      {addedProduct && (
        <div className="product-display">
          <h3 className="product-display-title">สินค้าที่เพิ่ม</h3>
          <p><strong>ชื่อสินค้า:</strong> {addedProduct.name}</p>
          <p><strong>รายละเอียด:</strong> {addedProduct.description}</p>
          <p><strong>ราคา:</strong> ฿{addedProduct.price}</p>
          <p><strong>หมวดหมู่:</strong> {addedProduct.category}</p>
          <p><strong>จำนวนในสต็อก:</strong> {addedProduct.stock}</p>
          <p><strong>บาร์โค้ด:</strong> {addedProduct.barcode}</p>
          {addedProduct.imageUrl && (
            <img
              src={addedProduct.imageUrl}
              alt={addedProduct.name}
              className="product-image"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
