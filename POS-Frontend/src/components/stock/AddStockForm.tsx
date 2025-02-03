import React, { useState } from "react";
import axios from "axios";
import "../styles/stock.css"; // นำเข้าไฟล์ CSS

const AddStockForm: React.FC = () => {
  // State สำหรับเก็บข้อมูลสินค้า
  const [stockData, setStockData] = useState({
    productId: "",
    name: "",
    quantity: "",
    supplier: "",
    location: "",
    threshold: "",
    status: "In Stock",
    lastRestocked: "",
  });

  const [message, setMessage] = useState(""); // เก็บข้อความแจ้งเตือน

  // ฟังก์ชันสำหรับจัดการค่า input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStockData({ ...stockData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันสำหรับส่งข้อมูลไปยัง API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/stock/add", stockData);
      setMessage(response.data.message);
      setStockData({ 
        productId: "", name: "", quantity: "", supplier: "", location: "", threshold: "", status: "In Stock", lastRestocked: "" 
      });
    } catch (error) {
      setMessage("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    }
  };

  return (
    <div className="stock-container">
      <h2>เพิ่มสินค้าในสต็อก</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="stock-form">
        <label>รหัสสินค้า (Product ID):</label>
        <input type="text" name="productId" value={stockData.productId} onChange={handleChange} required />

        <label>ชื่อสินค้า:</label>
        <input type="text" name="name" value={stockData.name} onChange={handleChange} required />

        <label>จำนวน (Quantity):</label>
        <input type="number" name="quantity" value={stockData.quantity} onChange={handleChange} required />

        <label>ซัพพลายเออร์ (Supplier):</label>
        <input type="text" name="supplier" value={stockData.supplier} onChange={handleChange} required />

        <label>สถานที่จัดเก็บ (Location):</label>
        <input type="text" name="location" value={stockData.location} onChange={handleChange} required />

        <label>ระดับแจ้งเตือนต่ำสุด (Threshold):</label>
        <input type="number" name="threshold" value={stockData.threshold} onChange={handleChange} required />

        <label>สถานะสินค้า:</label>
        <select name="status" value={stockData.status} onChange={handleChange}>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <label>วันที่อัปเดตล่าสุด:</label>
        <input type="date" name="lastRestocked" value={stockData.lastRestocked} onChange={handleChange} required />

        <button type="submit">เพิ่มสินค้า</button>
      </form>
    </div>
  );
};

export default AddStockForm;
