import React, { useEffect, useState } from "react";
import { fetchSalesSummary } from "../../api/receipt/receiptApi";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SummaryData {
    totalPrice: number;
    amountPaid: number;
    changeAmount: number;
    count: number;
    details: {
        employeeName: string;
        timestamp: string;
        items: { name: string; quantity: number; subtotal: number }[];
    }[];
}

export default function SalesSummary() {
    const [today, setToday] = useState<SummaryData | null>(null);
    const [thisWeek, setThisWeek] = useState<SummaryData | null>(null);
    const [thisMonth, setThisMonth] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getSummary = async () => {
        try {
            const res = await fetchSalesSummary();
            if (res.success) {
                setToday(res.today);
                setThisWeek(res.thisWeek);
                setThisMonth(res.thisMonth);
            } else {
                setError("ไม่สามารถดึงข้อมูลได้");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
        };
        getSummary();
    }, []);

    if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;
    if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

  // กราฟยอดขายรายวันจาก thisWeek
    const salesData = {
        labels: thisWeek?.details.map((d) =>
        new Date(d.timestamp).toLocaleDateString("th-TH", {
            weekday: "short",
        })
        ),
        datasets: [
            {
                label: "ยอดขายรายวัน (บาท)",
                data: thisWeek?.details.map((d) => d.items.reduce((s, i) => s + i.subtotal, 0)) || [],
                backgroundColor: "#6c5ce7",
            },
        ],
    };

    return (
        <div className="report-sale-container">
            <header className="report-sale-header">
                <h1 className="report-sale-title">📊 รายงานยอดขาย</h1>
            </header>

            <main className="report-sale-main">
                <section className="report-sale-overview">
                    <h2>ภาพรวมยอดขาย</h2>
                    <p>ยอดขายวันนี้: ฿{today?.totalPrice.toLocaleString()}</p>
                    <p>จำนวนบิลวันนี้: {today?.count} ใบ</p>
                    <p>ยอดขายเดือนนี้: ฿{thisMonth?.totalPrice.toLocaleString()}</p>
                    <p>จำนวนบิลเดือนนี้: {thisMonth?.count} ใบ</p>
                </section>

                <section className="report-sale-chart">
                    <h2>ยอดขายรายวัน (สัปดาห์นี้)</h2>
                    <Bar data={salesData} />
                </section>
            </main>
        </div>
    );
}
