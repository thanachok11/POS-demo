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
          setPayments(response.data); // ดึงข้อมูลจาก response.data
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
        return "⏳ รอดำเนินการ"; // ใช้ emoji สำหรับสถานะ "รอดำเนินการ"
    }
  };
  const getPaymentMethodEmoji = (method: string) => {
    switch (method) {
      case "บัตรเครดิต":
        return "💳 บัตรเครดิต";
      case "โอนเงิน":
        return "💸 โอนเงิน";
      case "เงินสด":
        return "💵 เงินสด";
      default:
        return "💵"; // ใช้ emoji บัตรเครดิตเป็นค่าเริ่มต้น
    }
  };
  return (
    <div className="payment-container">
      <h1 className="payment-title">💰 รายการการชำระเงิน
</h1>

      {loading && <p className="payment-loading">กำลังโหลด...</p>}
      {error && <p className="payment-error">{error}</p>}

      {!loading && !error && (
        <table className="payment-table">
          <thead>
            <tr>
              <th>รหัสการขาย</th>
              <th>พนักงาน</th>
              <th>วิธีชำระเงิน</th>
              <th>จำนวนเงิน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.saleId}</td>
                  <td>{payment.employeeName}</td>
                  <td>{getPaymentMethodEmoji(payment.paymentMethod)}</td>
                  <td>{payment.amount.toLocaleString()} บาท</td>
                  <td>{getStatusEmoji(payment.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="payment-no-data">
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
