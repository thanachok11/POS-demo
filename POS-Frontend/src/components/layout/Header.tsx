import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
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
import { getStockData } from "../../api/stock/stock.ts";
import { getProducts } from "../../api/product/productApi.ts";
import LoginPageModal from "../auth/LoginPageModal.tsx";
import RegisterPageModal from "../auth/RegisterPageModal.tsx";
import { logoutUser } from '../../api/auth/auth.ts';;

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
const Header: React.FC<NavbarProps> = ({ isSidebarOpen, toggleSidebar, isLoggedIn, activeMenu }) => {
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
    const [openDropdown, setOpenDropdown] = useState(null);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    //const [showLoginAlert, setShowLoginAlert] = useState(false);

    const [hasSeenLowStock, setHasSeenLowStock] = useState(
        localStorage.getItem('hasSeenLowStock') === 'true'
    );
    const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
    const [showLowStockList, setShowLowStockList] = useState(false);

    const [stockData, setStockData] = useState<StockItem[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        if (showLowStockList) {
            setHasSeenLowStock(true);
            localStorage.setItem('hasSeenLowStock', 'true');
        }
    }, [showLowStockList]);


    useEffect(() => {
        if (lowStockItems.length > 0) {
            const lastItemIds = localStorage.getItem('lastLowStockIds');
            const newItemIds = JSON.stringify(lowStockItems.map(item => item.id || item.name)); // ใช้ id ถ้ามี

            if (lastItemIds !== newItemIds) {
                setHasSeenLowStock(false);
                localStorage.setItem('hasSeenLowStock', 'false');
                localStorage.setItem('lastLowStockIds', newItemIds);
            }
        }
    }, [lowStockItems]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // ตรวจว่าคลิกอยู่นอก notification dropdown จริงหรือไม่
            if (
                notificationRef.current &&
                !notificationRef.current.contains(target)
            ) {
                setNotificationOpen(false);
            }

            if (!target.closest(".item-dropdown")) {
                setOpenDropdown(null);
            }

            if (!target.closest(".user-dropdown")) {
                setUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("❌ ไม่พบ token");
                setLoading(false);
                return;
            }

            try {
                // 1. ดึงข้อมูล stock
                const stock = await getStockData(token);
                setStockData(stock);

                // 2. ดึงข้อมูลสินค้า
                const productData = await getProducts();
                if (productData.success && Array.isArray(productData.data)) {
                    setProducts(productData.data);

                    // 3. จับคู่สินค้าเหลือน้อยกับชื่อ
                    const lowStock = stock
                        .filter(item => item.quantity < 5)
                        .map(item => {
                            const matchedProduct = productData.data.find(
                                (product: any) => product.id === item.productId
                            );
                            return {
                                ...item,
                                name: item.productId?.name || "ไม่พบชื่อสินค้า"
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


    const handleMenuClick = (path: string, menuName: string) => {
        if (!user) {
            //setShowLoginAlert(true);
            return;
        }

        navigate(path);
    };

    const handleUserSettings = () => {
        navigate("/settingProfile");
    };
    const handleLogout = () => {
        logoutUser();
        navigate("/");
    };

    return (
        <>
            {/* {showLoginAlert && (
                <div className="Alert-modal-overlay">
                    <div className="Alert-modal">
                        <p className="Alert-title-login">กรุณาเข้าสู่ระบบก่อนใช้งานเมนูนี้</p>
                        <button className="Alert-modal-close" onClick={() => setShowLoginAlert(false)}>ปิด</button>
                    </div>
                </div>
            )} */}

            {/* ปุ่ม Toggle Sidebar */}
            {isLoggedIn && (
            <button className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
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
                    
                    <div className={`iconName ${isSidebarOpen ? "shifted" : "closed"}`}>
                        {activeMenu}
                    </div>
                    <div className="nav-right">
                        {user ? (
                            <>
                                {/* 🔔 Notification Dropdown */}
                                <div
                                    className="notification-dropdown"
                                    ref={notificationRef}
                                    onClick={() => {
                                        setNotificationOpen(!notificationOpen);
                                        setUserDropdown(false);
                                    }}
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
                                                        onClick={() => setShowLowStockList(prev => !prev)}
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
                                <div
                                    className="user-dropdown"
                                    ref={userRef}
                                    onClick={() => {
                                        setUserDropdown(!userdropdown);
                                        setNotificationOpen(false);
                                    }}
                                >
                                    <div className="user-info">
                                        <img src={user.profileImg} alt="User" className="avatar" />
                                        <div className="user-details">
                                            <span className="username">{user?.username || user?.name}</span>
                                            <span className="status-online">🟢 กำลังออนไลน์</span>
                                        </div>
                                        <FontAwesomeIcon icon={faCaretDown} className="icon caret-icon" />
                                    </div>

                                    {userdropdown && (
                                        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                            <p className="user-role">👤 Role: {user.role}</p>
                                            {/* เมนูตั้งค่าผู้ใช้ */}
                                            <button
                                                onClick={() => {
                                                    handleUserSettings();
                                                    handleMenuClick("/settingProfile", "ตั้งค่าผู้ใช้");
                                                }}
                                                className="settings-button"
                                            >
                                                <FontAwesomeIcon icon={faCog} className="icon settings-icon" /> ตั้งค่าผู้ใช้
                                            </button>
                                            {/* ปุ่มออกจากระบบ */}
                                            <button onClick={handleLogout} className="logout-button">
                                                <FontAwesomeIcon icon={faSignOutAlt} className="icon logout-icon" /> ออกจากระบบ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsLoginModalVisible(true)} className="login-button-header" name="login">
                                    <FontAwesomeIcon icon={faSignInAlt} className="icon" /> <span>Login</span>
                                </button>
                                <button onClick={() => setIsRegisterModalVisible(true)} className="register-button-header" name="register">
                                    <FontAwesomeIcon icon={faUserPlus} className="icon" /> <span>Register</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Login และ Register Modal */}
            <LoginPageModal isVisible={isLoginModalVisible} onClose={() => setIsLoginModalVisible(false)} />
            <RegisterPageModal isVisible={isRegisterModalVisible} onClose={() => setIsRegisterModalVisible(false)} />
        </>
    );
};

export default Header;
