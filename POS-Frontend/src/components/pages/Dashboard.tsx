import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styles/page/POSDashboard.css";
import { fetchSalesSummary } from "../../api/receipt/receiptApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type RangeKey = "daily" | "weekly" | "monthly";

export default function SalesSummary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<RangeKey>("daily");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSummary = async () => {
      setLoading(true);
      const res = await fetchSalesSummary(selectedDate, filter);
      if (res?.success) setData(res.data);
      setLoading(false);
    };
    getSummary();
  }, [selectedDate, filter]);

  if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;
  if (!data || !data.summary || !data.changes) return <p>ไม่พบข้อมูล</p>;

  // ---------- ใช้ "ยอดสุทธิ (หลังส่วนลด/คืนสินค้า)" เป็นหลัก ----------
  const summary = data.summary[filter] || {};
  const changes = data.changes[filter] || {};

  // เปอร์เซ็นต์เปลี่ยนแปลง: ใช้ netSalesChange ถ้ามี
  const salesChange =
    typeof changes.netSalesChange === "number"
      ? changes.netSalesChange
      : changes.totalSalesChange;

  const bestSellerRaw = (data.topProducts?.[filter] || [])[0] || {};
  const bestSeller = {
    name: bestSellerRaw.name ?? "-",
    quantity: bestSellerRaw.quantity ?? 0,
    revenue:
      typeof bestSellerRaw.netRevenue === "number"
        ? bestSellerRaw.netRevenue
        : bestSellerRaw.revenue ?? 0,
  };

  const formatChange = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0.00%";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };
  const iconChange = (value: number) =>
    value > 0 ? "▲" : value < 0 ? "▼" : "–";
  const getChangeColor = (value: number) =>
    value > 0 ? "positive" : value < 0 ? "negative" : "";

  // ---------- กราฟ: ใช้ netSales เป็นหลัก ----------
  const chartSet = data[filter] || [];
  const chartLabels = chartSet.map((d: any) => {
    const date = new Date(d.formattedDate.iso);
    return filter === "daily"
      ? date.toLocaleTimeString("th-TH", { hour: "2-digit" })
      : date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "ยอดขายสุทธิ (บาท)",
        // ใช้ netSales ถ้ามี, ถ้าไม่มีกลับไป totalSales
        data: chartSet.map(
          (d: any) =>
            (typeof d.netSales === "number" ? d.netSales : d.totalSales) || 0
        ),
        borderColor: "#6c5ce7",
        backgroundColor: "rgba(108, 92, 231, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#6c5ce7",
      },
    ],
  };

  const chartTitle =
    filter === "daily"
      ? "ยอดขายวันนี้ (สุทธิ)"
      : filter === "weekly"
      ? "ยอดขายรายสัปดาห์นี้ (สุทธิ)"
      : "ยอดขายรายเดือนนี้ (สุทธิ)";

  // ยอดรวมแสดงใต้กราฟ: ใช้ netSales ถ้ามี
  const totalNetSales =
    typeof summary.netSales === "number" ? summary.netSales : summary.totalSales;
  const totalNetSalesText = (totalNetSales || 0).toLocaleString();

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: chartTitle },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `฿${Number(ctx.raw || 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">📊 รายงานยอดขาย</h1>

      {/* 🔹 Filter */}
      <div className="dashboard-filters">
        {(["daily", "weekly", "monthly"] as RangeKey[]).map((type) => (
          <button
            key={type}
            className={filter === type ? "active" : ""}
            type="button"
            onClick={() => setFilter(type)}
          >
            {type === "daily"
              ? "รายวัน"
              : type === "weekly"
              ? "รายสัปดาห์"
              : "รายเดือน"}
          </button>
        ))}

        <DatePicker
          selected={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          locale={th}
          dateFormat={filter === "monthly" ? "MMMM yyyy" : "dd MMMM yyyy"}
          showMonthYearPicker={filter === "monthly"}
          className="date-picker"
        />
      </div>

      {/* 🔹 Summary Section (อิงยอดสุทธิ) */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>จำนวนชิ้นที่ขาย</h3>
          <p>{(summary.totalQuantity || 0).toLocaleString()} ชิ้น</p>
          <small className={getChangeColor(changes.totalQuantityChange)}>
            {iconChange(changes.totalQuantityChange)}{" "}
            {formatChange(changes.totalQuantityChange)}
          </small>
        </div>

        <div className="summary-card">
          <h3>ยอดขายสุทธิ</h3>
          <p>฿{(totalNetSales || 0).toLocaleString()}</p>
          <small className={getChangeColor(salesChange)}>
            {iconChange(salesChange)} {formatChange(salesChange)}
          </small>
        </div>

        <div className="summary-card">
          <h3>กำไรรวม</h3>
          <p>฿{(summary.totalProfit || 0).toLocaleString()}</p>
          <small className={getChangeColor(changes.totalProfitChange)}>
            {iconChange(changes.totalProfitChange)}{" "}
            {formatChange(changes.totalProfitChange)}
          </small>
        </div>

        <div className="summary-card">
          <h3>สินค้าขายดี</h3>
          <p>{bestSeller.name}</p>
          <small>{(bestSeller.quantity || 0).toLocaleString()} ชิ้น</small>
          <small className="revenue">
            ฿{(bestSeller.revenue || 0).toLocaleString()}
          </small>
        </div>
      </div>

      {/* 🔹 Chart (Net Sales) */}
      <div className="chart-container">
        <h2>{chartTitle}</h2>
        <Line data={chartData} options={options} />
        <p className="total-sales-text">
          💰 ยอดขายสุทธิทั้งหมด: ฿{totalNetSalesText}
        </p>
      </div>
    </div>
  );
}
