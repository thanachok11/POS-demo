import React, { useState } from "react";
import "../../styles/HomePage.css"; // ถ้าคุณใช้ไฟล์ CSS แยก

const HomePage: React.FC = () => {

  return (
    <div className={'home-container'}>
      <div className="text-section">
        <h1>ยินดีต้อนรับสู่ระบบ POS</h1>
        <p>ระบบที่ช่วยให้การขายของคุณเป็นเรื่องง่ายและสะดวกยิ่งขึ้น</p>
      </div>
      <div className="image-section">
        <img
          src="https://res.cloudinary.com/dboau6axv/image/upload/v1738153705/pos_ozpgmv.jpg"
          alt="POS Image"
        />
      </div>
    </div>
  );
};

export default HomePage;
