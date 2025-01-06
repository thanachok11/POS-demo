import React, { useState } from "react";
import { getProductByBarcode } from "../api/productApi.ts"; // import API
import "../styles/Barcode.css";
const BarcodeSearch: React.FC = () => {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <h2>Search Product by Barcode</h2>
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Enter barcode"
      />
      <button onClick={fetchProductByBarcode}>Search</button>

      {product && (
        <div>
          <h3>Product Details</h3>
          <p>Name: {product.name}</p>
          <p>Category: {product.category}</p>
          <p>Description: {product.description}</p>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>
        </div>
      )}

      {error && <p>{error}</p>}
    </div>
  );
};

export default BarcodeSearch;
