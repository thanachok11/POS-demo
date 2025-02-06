import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../../api/product/productApi.ts"; // เรียกใช้ API
import { jwtDecode } from "jwt-decode";

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{ username: string; userId: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // โหลดสินค้าในตะกร้าจาก localStorage หรือ state
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);

    // ดึงข้อมูลผู้ใช้จาก JWT Token
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setUserInfo({ username: decoded.username, userId: decoded.id });
    }
  }, []);

  // ฟังก์ชัน Checkout
  const handleCheckout = async () => {
    if (!userInfo) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
      return;
    }

    const orderData = {
      userId: userInfo.userId,
      username: userInfo.username,
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    };

    try {
      await placeOrder(orderData);
      alert("สั่งซื้อสำเร็จ!");
      localStorage.removeItem("cart"); // ล้างตะกร้าหลังจากสั่งซื้อสำเร็จ
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  return (
    <div>
      <h2>สรุปคำสั่งซื้อ</h2>
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>{item.name} - {item.quantity} ชิ้น - ฿{item.price * item.quantity}</li>
        ))}
      </ul>
      <button onClick={handleCheckout}>ยืนยันคำสั่งซื้อ</button>
    </div>
  );
};

export default Checkout;
