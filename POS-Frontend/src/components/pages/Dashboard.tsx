import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styles/page/POSDashboard.css";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  // ข้อมูลราคาสินค้า (สมมติราคาสินค้า)
  const productPrices = {
    tshirt: 250,  // ราคาของเสื้อยืด
    jeans: 500,   // ราคาของกางเกงยีนส์
    shoes: 800,   // ราคาของรองเท้าผ้าใบ
  };

  // ข้อมูลการขายจำนวนสินค้าที่ขายไปในแต่ละวัน
  const dailySales = [50, 80, 120, 150, 200, 230, 300];  // จำนวนสินค้าที่ขายในแต่ละวัน
  const monthlySales = dailySales.reduce((sum, current) => sum + current, 0); // ยอดขายรวมในเดือนนี้

  // ข้อมูลยอดขายรวมในแต่ละวัน
  const dailyRevenue = dailySales.map((quantity) => quantity * productPrices.tshirt);  // สมมติว่าใช้ราคาของเสื้อยืด
  const dailyRevenueToday = dailyRevenue[3]; // ยอดขายในวันนี้ (วันพฤหัสบดี)
  const monthlyRevenue = dailyRevenue.reduce((sum, current) => sum + current, 0);  // ยอดขายรวมในเดือนนี้

  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "จำนวนสินค้าที่ขายไป",
        data: dailySales,
        backgroundColor: "#6c5ce7",  // สีของกราฟ
        borderColor: "#4e44c2",      // สีขอบของกราฟ
        borderWidth: 1,              // ความหนาของขอบ
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "วันของสัปดาห์",
        },
      },
      y: {
        title: {
          display: true,
          text: "จำนวนสินค้าที่ขาย (ชิ้น)",
        },
      },
    },
  };

  return (
    <div className="report-sale-container">
      <header className="report-sale-header">
        <h1 className="report-sale-title">รายงานยอดขาย</h1>
      </header>
      <main className="report-sale-main">
        <section className="report-sale-overview">
          <h2 className="report-sale-overview-title">ภาพรวมยอดขาย</h2>
          <p className="report-sale-overview-text">จำนวนสินค้าที่ขายในวันนี้: 150 ชิ้น</p>
          <p className="report-sale-overview-text">ยอดขายในวันนี้: ฿{dailyRevenueToday.toLocaleString()}</p>
          <p className="report-sale-overview-text">จำนวนสินค้าขายรวมในเดือนนี้: {monthlySales} ชิ้น</p>
          <p className="report-sale-overview-text">ยอดขายรวมในเดือนนี้: ฿{monthlyRevenue.toLocaleString()}</p>
        </section>
        <section className="report-sale-product-info">
          <h2 className="report-sale-product-info-title">ข้อมูลสินค้าขายดี</h2>
          <p className="report-sale-product-info-text">เสื้อยืด: ขายไปแล้ว 1,000 ชิ้น</p>
          <p className="report-sale-product-info-text">กางเกงยีนส์: ขายไปแล้ว 500 ชิ้น</p>
          <p className="report-sale-product-info-text">รองเท้าผ้าใบ: ขายไปแล้ว 350 คู่</p>
        </section>
        <section className="report-sale-revenue">
          <h2 className="report-sale-revenue-title">ยอดขายในแต่ละวัน</h2>
          <ul className="report-sale-revenue-list">
            {dailyRevenue.map((revenue, index) => (
              <li key={index} className="report-sale-revenue-item">
                <span className="report-sale-revenue-day">{salesData.labels[index]}: </span>
                <span className="report-sale-revenue-amount">{`ยอดขาย: ฿${revenue.toLocaleString()}`}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="report-sale-chart">
          <h2 className="report-sale-chart-title">การขายสินค้ารายวัน</h2>
          <Bar className="report-sale-bar-chart" data={salesData} options={salesOptions} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
