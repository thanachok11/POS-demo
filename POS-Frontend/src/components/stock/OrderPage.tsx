import React, { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../api/product/orderApi";
import "../../styles/order/OrderPage.css";

interface Item {
    productId: string;
    productName: string;
    quantity: number;
}

interface Order {
    _id: string;
    items: Item[];
    location: string;
    status: string;
    orderDate: string;
    supplierCompany: string;
}

const statusOptions = ["รอการชำระเงิน", "ชำระเงินแล้ว", "ยกเลิกรายการ"];

const OrderPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderIds, setUpdatingOrderIds] = useState<string[]>([]);

    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const orders = await getOrders(token);
            console.log("Orders loaded:", orders);
            setOrders(orders);
        } catch {
            setError("โหลดคำสั่งซื้อไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);
    
    const formatThaiDateTime = (dateString: string) =>
        new Date(dateString).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Bangkok"
        }).replace("น.", "").trim() + " น.";
      
    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderIds((prev) => [...prev, orderId]);
        try {
            const token = localStorage.getItem("token") || "";
            await updateOrderStatus(orderId, newStatus, token);

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch {
            alert("อัปเดตสถานะล้มเหลว");
        } finally {
            setUpdatingOrderIds((prev) =>
                prev.filter((id) => id !== orderId)
            );
        }
    };

    if (loading) return <p className="order-loading">กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="order-error">{error}</p>;

    // ด้านบน: เพิ่ม useRef และฟังก์ชันใหม่
    const handlePrintReceipt = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const itemsHTML = order.items
            .map(
                (item) =>
                    `<tr>
                    <td>${item.productName}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                </tr>`
            )
            .join('');

        printWindow.document.write(`
        <html>
        <head>
            <title>ใบเสร็จคำสั่งซื้อ</title>
            <style>
                body {
                    font-family: 'TH SarabunPSK', sans-serif;
                    padding: 40px;
                    line-height: 1.6;
                    font-size: 18px;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                table, th, td {
                    border: 1px solid #000;
                }
                th, td {
                    padding: 8px 12px;
                }
                .signature-box {
                    margin-top: 40px;
                }
                .signature-line {
                    margin-top: 60px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <h2>ใบเสร็จคำสั่งซื้อ</h2>
            <p><strong>บริษัทผู้จัดส่ง:</strong> ${order.supplierCompany}</p>
            <p><strong>สถานที่จัดส่ง:</strong> ${order.location}</p>
            <p><strong>วันที่สั่งซื้อ:</strong> ${formatThaiDateTime(order.orderDate)}</p>
            <p><strong>สถานะ:</strong> ${order.status}</p>

            <table>
                <thead>
                    <tr>
                        <th>ชื่อสินค้า</th>
                        <th>จำนวน</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div class="signature-box">
                <p><strong>ลายเซ็นผู้รับสินค้า:</strong></p>
                <div class="signature-line">..............................................................</div>
            </div>

            <script>
                window.print();
            </script>
        </body>
        </html>
    `);

        printWindow.document.close();
    };


    return (
        <div className="display">
        <div className="order-container">
            <h1 className="order-title">รายการคำสั่งซื้อของคุณ</h1>
            {orders.length === 0 ? (
                <p className="order-empty">ยังไม่มีคำสั่งซื้อ</p>
            ) : (
                <div className="order-list">
                    {orders.map((order) => {
                        const isUpdating = updatingOrderIds.includes(order._id);
                        return (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <h2>คำสั่งซื้อ</h2>
                                    <span className={`order-status status-${order.status}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-items">
                                    <h4>รายการสินค้า:</h4>
                                    <ul>
                                        {order.items.map((item, index) => (
                                            <li key={index}>
                                                {item.productName} - จำนวน: {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <p>สถานที่: {order.location}</p>
                                <p>ผู้จัดส่ง: {order.supplierCompany}</p>
                                <p>วันที่สั่งซื้อ: {formatThaiDateTime(order.orderDate)}</p>

                                <div className="order-actions">
                                    <label htmlFor={`status-${order._id}`}>เปลี่ยนสถานะ:</label>
                                    <select
                                        id={`status-${order._id}`}
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                        disabled={isUpdating}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    {isUpdating && (
                                        <span className="updating-text">กำลังอัปเดต...</span>
                                    )}
                                </div>
                                <button
                                    className="print-button"
                                    onClick={() => handlePrintReceipt(order)}
                                >
                                    🧾 พิมพ์ใบเสร็จ
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        </div>
    );
};

export default OrderPage;
