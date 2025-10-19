import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  Label,
} from "recharts";

import "../../styles/page/HomePage.css";

// === APIs ===
import { fetchSalesSummary } from "../../api/receipt/receiptApi";
import { getAllPayments } from "../../api/payment/paymentApi";
import { getPurchaseOrders } from "../../api/purchaseOrder/purchaseOrderApi";
import { getStockTransactions } from "../../api/stock/transactionApi";
import { getProducts } from "../../api/product/productApi";

import TopProductsSlider from "./TopProductsSlider";

const COLORS = ["#6C5CE7", "#00C49F", "#FF6B6B", "#FFA62B", "#5AD8A6", "#845EC2"];
const GRADIENTS = {
  purple: { id: "gPurple", from: "#6C5CE7", to: "rgba(108,92,231,0.12)" },
  teal: { id: "gTeal", from: "#00C49F", to: "rgba(0,196,159,0.12)" },
};
type RangeKey = "daily" | "weekly" | "monthly";
const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/512/2331/2331970.png";

// helper: เทียบวันตามโซนเวลาไทย
function isSameBangkokDay(d: Date, target: Date) {
  const toBKK = (x: Date) =>
    new Date(x.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const a = toBKK(d);
  const b = toBKK(target);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function HomePage() {
  // ----- states -----
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [summaryData, setSummaryData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [stockTx, setStockTx] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [filter, setFilter] = useState<RangeKey>("weekly");
  const [selectedDate] = useState<Date>(new Date());

  // ----- effects: top-level only -----
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try { setUser(jwtDecode(token)); } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [salesRes, payRes, poRes, txRes, prodRes] = await Promise.all([
          fetchSalesSummary(selectedDate, filter),
          getAllPayments(),
          getPurchaseOrders(token),
          getStockTransactions(token),
          getProducts(),
        ]);

        if (salesRes?.success) setSummaryData(salesRes.data || null);

        const payList = Array.isArray(payRes?.data)
          ? payRes.data
          : Array.isArray(payRes)
          ? payRes
          : [];
        setPayments(payList);

        const poList = Array.isArray(poRes?.data)
          ? poRes.data
          : Array.isArray(poRes)
          ? poRes
          : [];
        setPurchaseOrders(poList);

        const txList = Array.isArray(txRes?.data)
          ? txRes.data
          : Array.isArray(txRes)
          ? txRes
          : [];
        setStockTx(txList);

        const prodList = Array.isArray(prodRes?.data)
          ? prodRes.data
          : Array.isArray(prodRes)
          ? prodRes
          : [];
        setProducts(prodList);
      } catch (e) {
        console.error("Load dashboard blocks failed:", e);
      }
    };
    load();
  }, [user, filter, selectedDate]);

  // ----- ALL hooks (useMemo) MUST be before any early return -----

  // 1) รูปสินค้าแมพจาก products
  const imageMap = useMemo(
    () =>
      new Map(
        (products || []).map((p: any) => [
          p.productId?.barcode || p.barcode,
          p.productId?.imageUrl || p.imageUrl,
        ])
      ),
    [products]
  );

  // 2) Payments เฉพาะ “วันนี้”
  const todayPayments = useMemo(
    () =>
      (payments || []).filter(
        (p) => p?.createdAt && isSameBangkokDay(new Date(p.createdAt), selectedDate)
      ),
    [payments, selectedDate]
  );

  // 3) Top products (เติมรูป)
  const topProductsFromApi = useMemo(() => {
    const base = summaryData?.topProducts?.weekly || [];
    return base.slice(0, 10).map((p: any) => ({
      name: p.name,
      barcode: p.barcode,
      imageUrl: imageMap.get(p.barcode) || DEFAULT_IMG,
      quantity: p.quantity,
      revenue: p.revenue ?? p.netRevenue ?? 0,
    }));
  }, [summaryData, imageMap]);

  // ----- จากนี้จะมี early return ได้ เพราะ hooks ทั้งหมดข้างบนถูกเรียกทุกครั้งแล้ว -----
  if (loading) {
    return <div style={{ textAlign: "center", padding: 50 }}>⏳ กำลังตรวจสอบผู้ใช้...</div>;
  }
  if (!user) {
    return <div style={{ textAlign: "center", padding: 50 }}>กรุณาเข้าสู่ระบบ</div>;
  }
  if (!summaryData) {
    return <div style={{ textAlign: "center", padding: 50 }}>⏳ กำลังโหลดข้อมูล...</div>;
  }

  // ====== เส้นรายชั่วโมงวันนี้ ======
  const weekBuckets = summaryData.weekly || [];
  const lineData = weekBuckets.map((b: any) => ({
    label:
      b?.hour !== undefined
        ? `${String(b.hour).padStart(2, "0")}:00`
        : new Date(b.formattedDate?.iso || Date.now()).toLocaleTimeString("th-TH", { hour: "2-digit" }),
    value: Number(b?.netSales ?? b?.totalSales ?? 0),
  }));

  // ====== รวม amount & profit ของ “วันนี้” จาก todayPayments ======
  const paymentAgg = todayPayments.reduce(
    (acc, p) => {
      const amt = Number(p.amount ?? 0);
      const prf = Number(p.profit ?? 0);
      acc.sumAmount += amt;
      acc.sumProfit += prf;
      const d = new Date(p.createdAt || p.updatedAt || Date.now());
      const hour = d.toLocaleTimeString("th-TH", { hour: "2-digit" });
      acc.byHour[hour] = (acc.byHour[hour] || 0) + amt;
      return acc;
    },
    { sumAmount: 0, sumProfit: 0, byHour: {} as Record<string, number> }
  );
  const sumAmount = paymentAgg.sumAmount;
  const sumProfit = paymentAgg.sumProfit;
  const paySeries = Object.keys(paymentAgg.byHour)
    .sort((a, b) => Number(a) - Number(b))
    .map((h) => ({ hour: `${h}:00`, amount: paymentAgg.byHour[h] }));
  const paymentPie = [
    { name: "กำไร", value: sumProfit },
    { name: "รายได้หล้งหักกำไร", value: Math.max(sumAmount - sumProfit, 0) },
  ];

  // ====== PO วันนี้ + QC ผ่าน ======
  const todayPOs = (purchaseOrders || []).filter(
    (po) => po?.createdAt && isSameBangkokDay(new Date(po.createdAt), selectedDate)
  );
  const approvedTotalsByProduct: Record<string, { name: string; value: number }> = {};
  todayPOs.forEach((po: any) => {
    const approvedBatches = new Set(
      (po.stockLots || [])
        .filter((s: any) => (s.qcStatus || "").trim() === "ผ่าน")
        .map((s: any) => s.batchNumber)
    );
    (po.items || []).forEach((it: any) => {
      const batch = it.batchNumber || "";
      if (!approvedBatches.has(batch)) return;
      const name = it.productName || it.productId?.name || "-";
      const total = Number(it.total ?? (it.costPrice || 0) * (it.quantity || 0));
      approvedTotalsByProduct[name] = {
        name,
        value: (approvedTotalsByProduct[name]?.value || 0) + total,
      };
    });
  });
  const poPie = Object.values(approvedTotalsByProduct)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const poExpenseToday = poPie.reduce((s, x) => s + x.value, 0);

  // ====== Timeline สต็อก ======
  const timeline = [...(stockTx || [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp || 0).getTime() -
        new Date(a.createdAt || a.timestamp || 0).getTime()
    )
    .slice(0, 10)
    .map((t) => ({
      when: new Date(t.createdAt || t.timestamp || Date.now()).toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: (t.type || t.action || t.direction || "").toString().toUpperCase(),
      ref: t.reference || t.refNo || t.poCode || t.docNo || "-",
      name: t.productName || t.itemName || t.product?.name || "-",
      qty: Number(t.quantity ?? t.qty ?? 0),
    }));

  // ====== UI ======
  return (
    <div className="display">
      <div className="dashboard-overview">
        <div className="dash-grid">
          {/* Top 5 */}
          <section className="panel card-like area-top5">
            <h2 className="section-title">สินค้าขายดี (Top 5)</h2>
            <TopProductsSlider items={topProductsFromApi.slice(0, 5)} width={200} height={150} />
          </section>

          {/* เส้นรายชั่วโมง */}
          <section className="panel card-like area-receipt">
            <h2 className="section-title">กราฟยอดขายรายสัปดาห์</h2>
            <div className="chart-rect">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <defs>
                    <linearGradient id={GRADIENTS.purple.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENTS.purple.from} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={GRADIENTS.purple.to} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `฿${Number(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#6C5CE7" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="value" stroke="none" fill="url(#gPurple)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* พาย 1: Payments */}
          <section className="panel card-like area-pie1">
            <h2 className="section-title">Payment: รายได้ & กำไรรวม (วันนี้)</h2>
            <div className="pie-rect">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(v: number) => `฿${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Pie data={paymentPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {paymentPie.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                    <Label
                      value={`฿${sumAmount.toLocaleString()}`}
                      position="center"
                      style={{ fontWeight: 700, fontSize: 15 }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* พาย 2: PO (QC ผ่าน) */}
          <section className="panel card-like area-pie2">
            <h2 className="section-title">Purchase Orders (QC ผ่าน วันนี้)</h2>
            <div className="pie-rect">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(v: number) => `฿${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Pie data={poPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    {poPie.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* KPI */}
          <div className="kpi card-like area-kpi1">
            <div className="kpi-head">ยอดขายสุทธิ (วันนี้)</div>
            <div className="kpi-val">
              ฿
              {Number(
                summaryData.summary?.weekly?.netSales ??
                  summaryData.summary?.weekly?.totalSales ??
                  0
              ).toLocaleString()}
            </div>
          </div>
          <div className="kpi card-like area-kpi2">
            <div className="kpi-head">จำนวนที่ขาย</div>
            <div className="kpi-val">
              {Number(summaryData.summary?.weekly?.totalQuantity ?? 0).toLocaleString()} ชิ้น
            </div>
          </div>
          <div className="kpi card-like area-kpi3">
            <div className="kpi-head">กำไรรวม</div>
            <div className="kpi-val">
              ฿{Number(summaryData.summary?.weekly?.totalProfit ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="kpi card-like area-kpi4">
            <div className="kpi-head">ค่าใช้จ่าย PO (QC ผ่าน วันนี้)</div>
            <div className="kpi-val">฿{poExpenseToday.toLocaleString()}</div>
          </div>

          {/* Timeline */}
          <section className="panel card-like area-timeline">
            <h2 className="section-title">Recent Stock Transaction</h2>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className={`dot ${t.type.includes("OUT") ? "out" : "in"}`} />
                  <div className="content">
                    <div className="line1">
                      <span className="when">{t.when}</span>
                      <span className={`pill ${t.type.includes("OUT") ? "danger" : "success"}`}>{t.type}</span>
                    </div>
                    <div className="line2">
                      <span className="name">{t.name}</span>
                      <span className="qty">× {t.qty.toLocaleString()}</span>
                    </div>
                    <div className="line3 muted">อ้างอิง: {t.ref}</div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && <div className="muted">— ไม่มีข้อมูล —</div>}
            </div>
          </section>

          {/* Payment history (วันนี้) + ตาราง */}
          <section className="panel card-like area-payment">
            <h2 className="section-title">Payment (ประวัติการขายวันนี้)</h2>
            <div className="chart-rect" style={{ marginBottom: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paySeries}>
                  <defs>
                    <linearGradient id={GRADIENTS.teal.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENTS.teal.from} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={GRADIENTS.teal.to} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `฿${Number(v).toLocaleString()}`} />
                  <Area type="monotone" dataKey="amount" stroke="#00C49F" fill="url(#gTeal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ overflow: "auto", maxHeight: 240 }}>
              <table className="nice-table" style={{ width: "100%", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th>เวลา</th>
                    <th>รหัสขาย</th>
                    <th>วิธีชำระ</th>
                    <th>พนักงาน</th>
                    <th style={{ textAlign: "right" }}>ยอดชำระ (amount)</th>
                    <th style={{ textAlign: "right" }}>กำไร (profit)</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {todayPayments.map((p, idx) => (
                    <tr key={idx}>
                      <td>{new Date(p.createdAt || p.updatedAt).toLocaleString("th-TH")}</td>
                      <td>{p.saleId}</td>
                      <td>{p.paymentMethod}</td>
                      <td>{p.employeeName}</td>
                      <td style={{ textAlign: "right" }}>฿{Number(p.amount || 0).toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>฿{Number(p.profit || 0).toLocaleString()}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                  {todayPayments.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#6b7280" }}>— ไม่มีรายการ —</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
