import { useState } from "react";
import { addStock } from '../../api/stock/stock.ts'; // นำเข้าฟังก์ชันที่ดึงข้อมูลจาก API
import React from "react";

const AddStockForm = () => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [supplier, setSupplier] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStock({ productId, quantity, supplier, location });
      alert("เพิ่มสินค้าเข้าสต็อกสำเร็จ!");
    } catch (error) {
      alert("เกิดข้อผิดพลาด!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
      <input type="number" placeholder="จำนวนสินค้า" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <input type="text" placeholder="ผู้จำหน่าย" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
      <input type="text" placeholder="ที่เก็บสินค้า" value={location} onChange={(e) => setLocation(e.target.value)} />
      <button type="submit">เพิ่มสินค้า</button>
    </form>
  );
};

export default AddStockForm;
