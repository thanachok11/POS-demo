import React, { useState } from "react";
import { getProductByBarcode } from "../../api/product/productApi.ts"; // import API
import { BrowserBarcodeReader } from "@zxing/library";

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
        console.error("Image data is not a string");
        return;
      }

      const codeReader = new BrowserBarcodeReader();
      try {
        const result = await codeReader.decodeFromImage(undefined, imageData);
        setBarcode(result.getText()); // ใช้ `.getText()` แทน `.text`
      } catch (error) {
        console.error("Error decoding barcode:", error);
        alert("Unable to read barcode. Please try again with a clearer image.");
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
      setError("Product not found");
      setProduct(null);
    }
  };

  return (
    <div>
      <h1>Upload Image to Scan Barcode</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {barcode && (
        <div>
          <p>Detected Barcode: {barcode}</p>
          <button onClick={fetchProductByBarcode }>Search Product</button>
        </div>
      )}
      {product && (
        <div>
          <h2>Product Details</h2>
          <p>Name: {product.name}</p>
          <p>Price: {product.price}</p>
          <p>Description: {product.description}</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeUploader;
