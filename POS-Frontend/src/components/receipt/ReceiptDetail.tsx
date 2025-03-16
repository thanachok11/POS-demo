import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchReceiptById } from "../../api/receipt/receiptApi.ts";
import "../../styles/receipt/ReceiptDetail.css";
import React from "react";

interface Item {
    barcode: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    _id: string;
}

interface Receipt {
    _id: string;
    paymentId: string;
    employeeName: string;
    items: Item[];
    totalPrice: number;
    paymentMethod: string;
    amountPaid: number;
    changeAmount: number;
    timestamp: string;
}

export default function ReceiptDetail() {
    const { paymentId } = useParams<{ paymentId?: string }>(); // อนุญาตให้ paymentId เป็น undefined
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!paymentId) {
            setError("ไม่พบข้อมูลใบเสร็จ");
            setLoading(false);
            return;
        }

        const getReceiptDetail = async () => {
            try {
                const response = await fetchReceiptById(paymentId);
                console.log(response);
                setReceipt(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            } finally {
                setLoading(false);
            }
        };

        getReceiptDetail();
    }, [paymentId]);

    return (
        <div className="receipt-detail-container">
            <h1 className="receipt-detail-title">🧾 รายละเอียดใบเสร็จ</h1>

            {loading && <p className="receipt-loading">กำลังโหลดข้อมูล...</p>}
            {error && <p className="receipt-error">{error}</p>}

            {!loading && !error && receipt && (
                <div className="receipt-info">
                    <p><strong>พนักงาน:</strong> {receipt.employeeName ?? "ไม่ระบุ"}</p>
                    <p><strong>ยอดรวม:</strong> {receipt.totalPrice?.toLocaleString() ?? "0"} บาท</p>
                    <p><strong>วิธีการชำระเงิน:</strong> {receipt.paymentMethod ?? "ไม่ระบุ"}</p>
                    <p><strong>จำนวนเงินที่จ่าย:</strong> {receipt.amountPaid?.toLocaleString() ?? "0"} บาท</p>
                    <p><strong>เงินทอน:</strong> {receipt.changeAmount?.toLocaleString() ?? "0"} บาท</p>
                    <p><strong>วันที่:</strong> {receipt.timestamp ? new Date(receipt.timestamp).toLocaleString() : "ไม่ระบุ"}</p>


                    <h2>🛒 รายการสินค้า</h2>
                    <table className="receipt-item-table">
                        <thead>
                            <tr>
                                <th>ลำดับ</th>
                                <th>ชื่อสินค้า</th>
                                <th>ราคา/หน่วย</th>
                                <th>จำนวน</th>
                                <th>ราคารวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt?.items && receipt.items.length > 0 ? (
                                receipt.items.map((item, index) => (
                                    <tr key={item._id ?? index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name ?? "ไม่ระบุ"}</td>
                                        <td>{item.price?.toLocaleString() ?? "0"} บาท</td>
                                        <td>{item.quantity ?? "0"}</td>
                                        <td>{item.subtotal?.toLocaleString() ?? "0"} บาท</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>ไม่มีรายการสินค้า</td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}
