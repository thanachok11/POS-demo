import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { getStockData } from "../../api/stock/stock";

import "../../styles/page/Notification.css";

interface StockItem {
    _id: string;
    barcode: string;
    name: string;
    imageUrl: string;
    quantity: number;
    updatedAt: string;
    location: string;
    status: string;
    supplier: string;
    category: string;
    threshold?: number;
}

interface NotificationDropdownProps {
    notificationOpen: boolean;
    setNotificationOpen: (value: boolean) => void;
    hasSeenLowStock: boolean;
    showLowStockList: boolean;
    setShowLowStockList: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    notificationOpen,
    setNotificationOpen,
    hasSeenLowStock,
    showLowStockList,
    setShowLowStockList,
}) => {
    const notificationRef = useRef<HTMLDivElement>(null);
    const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);

    // 📌 โหลด stock data มาเช็ค threshold
    const fetchStock = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const stock = await getStockData(token);

            const lowStock = stock
                .filter((item: StockItem) => item.quantity <= (item.threshold ?? 5))
                .map((item: any) => ({
                    ...item,
                    name: item.productId?.name || "ไม่พบชื่อสินค้า",
                }));

            setLowStockItems(lowStock);
        } catch (err) {
            console.error("❌ โหลด stock ไม่สำเร็จ", err);
        }
    };

    useEffect(() => {
        // โหลดครั้งแรก
        fetchStock();

        // ✅ refresh ทุก ๆ 60 วินาที
        const interval = setInterval(fetchStock, 60000);

        return () => clearInterval(interval); // ล้างตอน unmount
    }, []);

    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (notificationRef.current && !notificationRef.current.contains(target)) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setNotificationOpen]);

    return (
        <div
            className="notification-dropdown"
            ref={notificationRef}
            onClick={() => setNotificationOpen(!notificationOpen)}
        >
            <div className="notification-wrapper">
                <FontAwesomeIcon icon={faBell} className="icon notification-icon" />
                {lowStockItems.length > 0 && !hasSeenLowStock && (
                    <span className="notification-length">{lowStockItems.length}</span>
                )}
            </div>

            {notificationOpen && (
                <div className="notification-menu" onClick={(e) => e.stopPropagation()}>
                    <p className="notification-item">🔔 การแจ้งเตือนใหม่</p>

                    {lowStockItems.length > 0 && (
                        <>
                            <div
                                className="notification-item low-stock-header clickable"
                                onClick={() => setShowLowStockList((prev) => !prev)}
                            >
                                📦 สินค้าเหลือน้อย
                                <span className="low-stock-count">
                                    ({lowStockItems.length} รายการ)
                                </span>
                            </div>
                            {showLowStockList &&
                                lowStockItems.map((item, index) => (
                                    <p key={index} className="notification-item clickable">
                                        • {item.name} เหลือ {item.quantity} ชิ้น
                                    </p>
                                ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
