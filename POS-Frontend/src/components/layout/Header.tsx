import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSignOutAlt,
    faSignInAlt,
    faUserPlus,
    faCaretDown,
    faBars,
    faTimes,
    faCog,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getStockData } from "../../api/stock/stock";
import { getProducts } from "../../api/product/productApi";
import LoginPageModal from "../auth/LoginPageModal";
import RegisterPageModal from "../auth/RegisterPageModal";
import { logoutUser } from "../../api/auth/auth";

import NotificationDropdown from "../layout/NotificationDropdown";
import UserDropdown from "../layout/UserDropdown";

import "../../styles/layout/Header.css";
import "../../styles/page/Notification.css";

interface NavbarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isLoggedIn: boolean;
    activeMenu: string;
}

interface StockItem {
    id: string;
    barcode: string;
    name: string;
    imageUrl: string;
    quantity: number;
    updatedAt: string;
    location: string;
    status: string;
    supplier: string;
    category: string;
}

const Header: React.FC<NavbarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    isLoggedIn,
    activeMenu,
}) => {
    const [user, setUser] = useState<{
        name: string;
        username: string;
        email: string;
        role: string;
        profileImg: string;
        nameStore: string;
    } | null>(null);

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [userdropdown, setUserDropdown] = useState(false);

    const userRef = useRef<HTMLDivElement>(null);

    const [hasSeenLowStock, setHasSeenLowStock] = useState(
        localStorage.getItem("hasSeenLowStock") === "true"
    );
    const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
    const [showLowStockList, setShowLowStockList] = useState(false);

    const [stockData, setStockData] = useState<StockItem[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const navigate = useNavigate();

    // ✅ Decode token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUser({
                    name: decoded.name,
                    username: decoded.username,
                    email: decoded.email,
                    role: decoded.role,
                    nameStore: decoded.nameStore,
                    profileImg: decoded.profile_img || "default-avatar.png",
                });
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    // ✅ เมื่อเปิดดู low stock แล้ว ถือว่า seen
    useEffect(() => {
        if (showLowStockList) {
            setHasSeenLowStock(true);
            localStorage.setItem("hasSeenLowStock", "true");
        }
    }, [showLowStockList]);

    // ✅ เช็คว่ามีสินค้า low stock ใหม่หรือไม่
    useEffect(() => {
        if (lowStockItems.length > 0) {
            const lastItemIds = localStorage.getItem("lastLowStockIds");
            const newItemIds = JSON.stringify(
                lowStockItems.map((item) => item.id || item.name)
            );

            if (lastItemIds !== newItemIds) {
                setHasSeenLowStock(false);
                localStorage.setItem("hasSeenLowStock", "false");
                localStorage.setItem("lastLowStockIds", newItemIds);
            }
        }
    }, [lowStockItems]);

    // ✅ Fetch Stock + Product
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("❌ ไม่พบ token");
                setLoading(false);
                return;
            }

            try {
                const stock = await getStockData(token);
                setStockData(stock);

                const productData = await getProducts();
                if (productData.success && Array.isArray(productData.data)) {
                    setProducts(productData.data);

                    const lowStock = stock
                        .filter((item: { quantity: number }) => item.quantity < 5)
                        .map((item: any) => {
                            return {
                                ...item,
                                name: item.productId?.name || "ไม่พบชื่อสินค้า",
                            };
                        });

                    setLowStockItems(lowStock);
                } else {
                    setError("❌ ไม่พบข้อมูลสินค้า");
                }
            } catch (err) {
                setError("❌ ดึงข้อมูลไม่สำเร็จ");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUserSettings = () => {
        navigate("/settingProfile");
    };

    const handleLogout = () => {
        logoutUser();
        navigate("/");
    };

    return (
        <>
            {/* ปุ่ม Toggle Sidebar */}
            {isLoggedIn && (
                <button
                    className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`}
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
                </button>
            )}

            {/* Navbar */}
            <nav className="navbar">
                <img
                    src="https://res.cloudinary.com/dboau6axv/image/upload/v1738923984/pos_icon_zpyzmj.png"
                    alt="Logo"
                    className="logo-image"
                />
                {isSidebarOpen && <span className="logo-text">EAZYPOS</span>}

                <div className="navbar-content">
                    <div
                        className={`iconName ${isSidebarOpen ? "shifted" : "closed"}`}
                    >
                        {activeMenu}
                    </div>

                    <div className="nav-right">
                        {user ? (
                            <>
                                {/* 🔔 Notification Dropdown */}
                                <NotificationDropdown
                                    notificationOpen={notificationOpen}
                                    setNotificationOpen={setNotificationOpen}                                   
                                    hasSeenLowStock={hasSeenLowStock}
                                    showLowStockList={showLowStockList}
                                    setShowLowStockList={setShowLowStockList}
                                />

                                {/* 👤 User Dropdown */}
                                <UserDropdown
                                    user={user}
                                    userdropdown={userdropdown}
                                    setUserDropdown={setUserDropdown}
                                    onSettings={handleUserSettings}
                                    onLogout={handleLogout}
                                />
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsLoginModalVisible(true)}
                                    className="login-button-header"
                                    name="login"
                                >
                                    <FontAwesomeIcon icon={faSignInAlt} className="icon" />{" "}
                                    <span>Login</span>
                                </button>
                                <button
                                    onClick={() => setIsRegisterModalVisible(true)}
                                    className="register-button-header"
                                    name="register"
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="icon" />{" "}
                                    <span>Register</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Login และ Register Modal */}
            <LoginPageModal
                isVisible={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
            />
            <RegisterPageModal
                isVisible={isRegisterModalVisible}
                onClose={() => setIsRegisterModalVisible(false)}
            />
        </>
    );
};

export default Header;
