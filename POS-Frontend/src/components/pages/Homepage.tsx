import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/Homepage.css";
import LoginPageModal from '../LoginPageModal.tsx'; // นำเข้า LoginPageModal ที่ใช้ใน Sidebar

const Homepage: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับตรวจสอบการเข้าสู่ระบบ
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    return token !== null; // ถ้ามี token แปลว่าเข้าสู่ระบบแล้ว
  };

  // ฟังก์ชันเปิด/ปิด LoginModal
  const toggleLoginModal = () => {
    setIsLoginModalVisible(!isLoginModalVisible);
  };

  // ฟังก์ชันจัดการปุ่ม
  const handleButtonClick = (action: string) => {
    if (!checkLoginStatus()) {
      // ถ้ายังไม่เข้าสู่ระบบ ให้เปิด LoginModal
      toggleLoginModal();
    } else {
      // ถ้าเข้าสู่ระบบแล้ว ให้ไปยังหน้า Product
      if (action === 'addProduct') {
        navigate('/add-products');
      } else {
        // สามารถเพิ่มเงื่อนไขอื่นๆ ตามปุ่มที่ต้องการ
        console.log('Handling other actions');
      }
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">ระบบจัดการสินค้า</h1>
        <p className="subtitle">จัดการสินค้าของคุณได้อย่างง่ายดายและสะดวก</p>
      </header>
      <main className="main">
        <div className="card">
          <h2 className="home-h2">เพิ่มสินค้า</h2>
          <p className="home-p">เพิ่มสินค้าลงในระบบของคุณ</p>
          <button className="btn" onClick={() => handleButtonClick('addProduct')}>
            เพิ่มสินค้า
          </button>
        </div>
        <div className="card">
          <h2 className="home-h2">จัดการสินค้า</h2>
          <p className="home-p">ดูและจัดการสินค้าทั้งหมดของคุณ</p>
          <button className="btn" onClick={() => handleButtonClick('manageProducts')}>
            จัดการสินค้า
          </button>
        </div>
        <div className="card">
          <h2 className="home-h2">รายงาน</h2>
          <p className="home-p">ตรวจสอบรายงานการขายและสินค้าคงคลัง</p>
          <button className="btn" onClick={() => handleButtonClick('viewReports')}>
            ดูรายงาน
          </button>
        </div>
      </main>

      {/* Login Modal */}
      {isLoginModalVisible && <LoginPageModal isVisible={isLoginModalVisible} onClose={toggleLoginModal} />}
    </div>
  );
};

export default Homepage;
