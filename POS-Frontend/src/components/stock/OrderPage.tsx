import React, { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../api/product/orderApi.ts";
import "../../styles/order/OrderPage.css";

interface Order {
    _id: string;
    productName: string;
    quantity: number;
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
    const [updatingOrderIds, setUpdatingOrderIds] = useState<string[]>([]); // เก็บ id ออเดอร์ที่กำลังอัปเดต

    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token") || "";
            const orders = await getOrders(token);
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

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderIds((prev) => [...prev, orderId]);
        try {
            const token = localStorage.getItem("token") || "";
            await updateOrderStatus(orderId, newStatus, token);

            // อัปเดตสถานะใน state ทันที ไม่ต้องโหลดใหม่ทั้งหมด (เพิ่มประสิทธิภาพ)
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch {
            alert("อัปเดตสถานะล้มเหลว");
        } finally {
            setUpdatingOrderIds((prev) => prev.filter((id) => id !== orderId));
        }
    };

    if (loading) return <p className="order-loading">กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="order-error">{error}</p>;

    return (
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
                                    <h2>{order.productName}</h2>
                                    <span className={`order-status status-${order.status}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p>จำนวน: {order.quantity}</p>
                                <p>สถานที่: {order.location}</p>
                                <p>ผู้จัดส่ง: {order.supplierCompany}</p>
                                <p>วันที่สั่งซื้อ: {new Date(order.orderDate).toLocaleString()}</p>

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
                                    {isUpdating && <span className="updating-text">กำลังอัปเดต...</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderPage;
