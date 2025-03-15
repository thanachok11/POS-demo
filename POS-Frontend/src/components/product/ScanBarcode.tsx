import React, { useState } from "react";
import { getProductByBarcode } from "../../api/product/productApi.ts"; // import API
import { BrowserBarcodeReader } from "@zxing/library";
import "../../styles/product/BarcodeUploader.css"; // นำเข้าไฟล์ CSS

const BarcodeUploader = () => {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const imageData = reader.result;
      if (typeof imageData !== "string") {
        console.error("ข้อมูลรูปภาพไม่ถูกต้อง");
        return;
      }

      const codeReader = new BrowserBarcodeReader();
      try {
        const result = await codeReader.decodeFromImage(undefined, imageData);
        setBarcode(result.getText()); // ใช้ `.getText()` แทน `.text`
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการสแกนบาร์โค้ด:", error);
        alert("ไม่สามารถอ่านบาร์โค้ดได้ กรุณาใช้รูปที่คมชัดขึ้น");
      }
    };

    reader.readAsDataURL(file);
  };

  const fetchProductByBarcode = async () => {
    try {
      const data = await getProductByBarcode(barcode); // เรียก API เพื่อดึงข้อมูลจาก barcode
      setProduct(data);
      setError(null);
    } catch (error) {
      setError("ไม่พบสินค้าในระบบ");
      setProduct(null);
    }
  };

  return (
    <div className="barcode-uploader-container">
      <h1 className="title">📸 อัปโหลดรูปภาพเพื่อสแกนบาร์โค้ด</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />

      {barcode && (
        <div className="barcode-result">
          <p>📌 บาร์โค้ดที่พบ: <strong>{barcode}</strong></p>
          <button onClick={fetchProductByBarcode} className="search-button">🔍 ค้นหาสินค้า</button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {product && (
        <div className="product-details">
          <h2>📦 รายละเอียดสินค้า</h2>
          <p><strong>ชื่อสินค้า:</strong> {product.name}</p>
          <p><strong>ราคา:</strong> {product.price} บาท</p>
          <p><strong>รายละเอียด:</strong> {product.description}</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeUploader;
