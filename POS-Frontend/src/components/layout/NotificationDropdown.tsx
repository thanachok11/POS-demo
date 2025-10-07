import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
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
    const [notificationCount, setNotificationCount] = useState(0);

    // 🔧 helper: ทำให้ข้อมูล stock เป็นรูปแบบเดียวกันเสมอ
    const normalizeStockItem = (raw: any): StockItem => ({
        _id: raw._id,
        barcode: raw.barcode ?? raw.productId?.barcode ?? "",
        name: raw.name ?? raw.productId?.name ?? "ไม่พบชื่อสินค้า",
        imageUrl: raw.imageUrl ?? raw.productId?.imageUrl ?? "",
        quantity: Number(raw.quantity ?? 0),
        updatedAt: raw.updatedAt ?? new Date().toISOString(),
        location:
            typeof raw.location === "object"
                ? raw.location?.name ?? raw.location?._id ?? ""
                : raw.location ?? "",
        status: raw.status ?? "",
        supplier:
            raw.supplier ??
            raw.supplierName ??
            raw.supplierId?.companyName ??
            "",
        category:
            typeof raw.category === "string"
                ? raw.category
                : raw.productId?.category?.name ?? "",
        threshold:
            raw.threshold !== undefined && raw.threshold !== null
                ? Number(raw.threshold)
                : 5,
    });

    const isLow = (item: StockItem) => item.quantity <= (item.threshold ?? 5);

    // ✅ โหลด stock ครั้งแรก (normalize ก่อนใส่ state)
    const fetchStock = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const stock = await getStockData(token);
            const normalized: StockItem[] = (stock || []).map(normalizeStockItem);
            setLowStockItems(normalized.filter(isLow));
        } catch (err) {
            console.error("❌ โหลด stock ไม่สำเร็จ", err);
        }
    };
    useEffect(() => {
        if (notificationOpen) {
            setNotificationCount(0);
        }
    }, [notificationOpen]);

    // Socket.io realtime update (normalize ก่อนใช้งานเสมอ)
    useEffect(() => {
        const socket = io("http://localhost:5000", { transports: ["websocket"] });

        socket.on("connect", () => {
            console.log("✅ Connected to socket server");
        });

        socket.on("stockUpdated", (raw: any) => {
            const updated = normalizeStockItem(raw);
            console.log("⚡️ Stock updated realtime:", updated);

            setLowStockItems((prev) => {
                const exists = prev.some((i) => i._id === updated._id);

                // เข้าเงื่อนไขเหลือน้อยตอนนี้
                if (isLow(updated)) {
                    if (!exists) {
                        // เพิ่ง “ตกเกณฑ์เหลือน้อย” → เพิ่มเข้า list + เพิ่ม badge
                        setNotificationCount((c) => c + 1);
                        return [...prev, updated];
                    }
                    // ยังคงเหลือน้อย → แค่อัปเดตรายการเดิม
                    return prev.map((i) => (i._id === updated._id ? updated : i));
                } else {
                    // ไม่เหลือน้อยแล้ว → ถ้ามีอยู่ให้ลบออก
                    if (exists) return prev.filter((i) => i._id !== updated._id);
                    return prev; // ไม่อยู่ใน list อยู่แล้ว ก็ไม่ต้องทำอะไร
                }
            });
        });

        // โหลดรอบแรก
        fetchStock();

        return () => {
            socket.disconnect();
        };
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [setNotificationOpen]);

    return (
        <div
            className="notification-dropdown"
            ref={notificationRef}
            onClick={() => setNotificationOpen(!notificationOpen)}
        >
            <div className="notification-wrapper">
                <FontAwesomeIcon icon={faBell} className="icon notification-icon" />
                {notificationCount > 0 && (
                    <span className="notification-length">{notificationCount}</span>
                )}

            </div>

            {notificationOpen && (
                <div className="notification-menu" onClick={(e) => e.stopPropagation()}>
                    <p className="notification-item">🔔 การแจ้งเตือนใหม่</p>

                    {lowStockItems.length > 0 ? (
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
                                lowStockItems.map((item) => (
                                    <p key={item._id} className="notification-item clickable">
                                        • {item.name} เหลือ {item.quantity} ชิ้น
                                    </p>
                                ))}
                        </>
                    ) : (
                        <p className="notification-item">✅ ไม่มีสินค้าคงเหลือน้อย</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
