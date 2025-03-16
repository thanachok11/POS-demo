import React from "react";
import "../../styles/page/ProductReport.css";

const ProductReport = () => {
  return (
    <div className="main-content">
      <div className="report-container">
        <h2 className="report-header">📊 รายงานสินค้า</h2>
        <div className="filter-section">
          <label>ช่วงเวลา:</label>
          <select>
            <option value="daily">รายวัน</option>
            <option value="monthly">รายเดือน</option>
          </select>
        </div>
        <div className="summary-box">
          <p>📦 สินค้าขายทั้งหมด: 120 ชิ้น</p>
          <p>💰 รายได้รวม: 6,000 บาท</p>
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>ขายแล้ว</th>
              <th>คงเหลือ</th>
              <th>ราคา</th>
              <th>รายได้</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>กาแฟดำ</td>
              <td>120</td>
              <td>30</td>
              <td>50 บาท</td>
              <td>6,000 บาท</td>
            </tr>
            <tr>
              <td>ลาเต้</td>
              <td>95</td>
              <td>20</td>
              <td>65 บาท</td>
              <td>6,175 บาท</td>
            </tr>
            {/* Add other rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductReport;
