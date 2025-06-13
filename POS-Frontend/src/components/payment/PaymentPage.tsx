import { useEffect, useState } from "react";
import { getAllPayments } from "../../api/payment/paymentApi.ts";
import "../../styles/payment/PaymentPage.css";
import React from "react";

interface Payment {
  _id: string;
  saleId: string;
  employeeName: string;
  paymentMethod: string;
  amount: number;
  status: string;
  createdAt: string; // เพิ่มฟิลด์วันที่
}

export default function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPayments = async () => {
      try {
        const response = await getAllPayments();
        console.log(response);
        if (response.success) {
          // เรียงลำดับจากวันที่ล่าสุด -> วันเก่าสุด
          const sortedPayments = response.data.sort(
            (a: Payment, b: Payment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPayments(sortedPayments);
        } else {
          setError("ไม่สามารถดึงข้อมูลได้");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getPayments();
  }, []);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "สำเร็จ":
        return "✅ สำเร็จ";
      case "ล้มเหลว":
        return "❌ ล้มเหลว";
      default:
        return "⏳ รอดำเนินการ";
    }
  };

  const getPaymentMethodEmoji = (method: string) => {
    switch (method) {
      case "บัตรเครดิต":
        return "ชำระด้วยบัตรเครดิต";
      case "QR Code":
        return "สแกน QR Code";
      case "เงินสด":
        return "ชำระด้วยเงินสด";
      case "โอนผ่านธนาคาร":
        return "โอนผ่านธนาคาร";
      case "พร้อมเพย์":
        return "พร้อมเพย์";
      default:
        return "วิธีชำระเงินอื่นๆ";
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="payment-container">
      <h1 className="payment-title">💰 รายการการชำระเงิน</h1>

      {loading && <p className="payment-loading">กำลังโหลด...</p>}
      {error && <p className="payment-error">{error}</p>}

      {!loading && !error && (
        <table className="payment-table">
          <thead>
            <tr>
              <th>ลำดับ</th> {/* เพิ่มคอลัมน์ลำดับ */}
              <th>รหัสการขาย</th>
              <th>พนักงาน</th>
              <th>วิธีชำระเงิน</th>
              <th>จำนวนเงิน</th>
              <th>สถานะ</th>
              <th>วันที่</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment._id}>
                  <td>{index + 1}</td> {/* แสดงลำดับตามวันที่ล่าสุด */}
                  <td>{payment.saleId}</td>
                  <td>{payment.employeeName}</td>
                  <td>{getPaymentMethodEmoji(payment.paymentMethod)}</td>
                  <td>{payment.amount.toLocaleString()} บาท</td>
                  <td>{getStatusEmoji(payment.status)}</td>
                  <td>{formatDate(payment.createdAt)}</td> {/* แสดงวันที่ */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="payment-no-data">
                  ไม่พบข้อมูลการชำระเงิน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
