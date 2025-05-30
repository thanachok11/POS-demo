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
  faShoppingCart,
  faHome,
  faBox,
  faChartLine,
  faCog,
  faReceipt,
  faHistory,
  faCartPlus,
  faFileInvoice,
  faExchangeAlt,
  faBarcode,
  faHandshake,
  faScroll,
  faExclamationTriangle,
  faClipboardList,

} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getStockData } from "../../api/stock/stock.ts";
import { getProducts } from "../../api/product/productApi.ts";
import LoginPageModal from "../auth/LoginPageModal.tsx";
import RegisterPageModal from "../auth/RegisterPageModal.tsx";
import "../../styles/page/Header.css";
import "../../styles/page/Notification.css";
interface NavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
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
const Header: React.FC<NavbarProps> = ({ isSidebarOpen, toggleSidebar }) => {
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
  const [activeMenu, setActiveMenu] = useState("ยินดีต้อนรับสู่ระบบจัดการสินค้า");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);


  const [errorMessage, setErrorMessage] = useState("");
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
                name: item.productId?.name || "ไม่พบชื่อสินค้า"              };
            });

          setLowStockItems(lowStock);

            console.log('Name',lowStock);
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
    setActiveMenu(menuName);
    navigate(path);
  };
  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };
  const handleUserSettings = () => {
    navigate("/settingProfile");
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <>
      {/* ปุ่ม Toggle Sidebar */}
      <button className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        {/* ส่วนแสดงชื่อร้าน */}
        <div className="sidebar-header">
          <span className="sidebar-logo-text">{user?.nameStore || "EAZYPOS"}</span>
        </div>

        <div className="sidebar-scrollable">
          {/* เมนู */}
          <ul className="navLinks">
            <li className="item-dropdown" onClick={() => toggleDropdown("management")}>
              <FontAwesomeIcon icon={faHome} className="icon" />
              <span className="menu-text-home">หน้าหลัก</span>
              <FontAwesomeIcon icon={faCaretDown} className={`dropdown-icon ${openDropdown === "management" ? "open" : ""}`} />
            </li>

            <ul className={`item-details ${openDropdown === "management" ? "open" : ""} ${isSidebarOpen ? "" : "floating"}`}>
              <li onClick={() => handleMenuClick("/shop", "ซื้อสินค้า")}>
                <FontAwesomeIcon icon={faShoppingCart} className="icon" /> <span className="dropdown-text-buy">ซื้อสินค้า</span>
              </li>
            </ul>
            <li className="item-dropdown" onClick={() => toggleDropdown("reports")}>
              <FontAwesomeIcon icon={faChartLine} className="icon" /> <span className="menu-text-dashboard">รายงาน</span>
              <FontAwesomeIcon icon={faCaretDown} className={`dropdown-icon ${openDropdown === "reports" ? "open" : ""}`} />
            </li>
            <ul className={`item-details ${openDropdown === "reports" ? "open" : ""} ${isSidebarOpen ? "" : "floating"}`}>
              <li onClick={() => handleMenuClick("/reports/sales", "รายงานยอดขาย")}>
                <FontAwesomeIcon icon={faFileInvoice} className="icon" /> <span className="dropdown-text-sale">รายงานยอดขาย</span>
              </li>
              <li onClick={() => handleMenuClick("/reports/stock", "รายงานสินค้าคงเหลือ")}>
                <FontAwesomeIcon icon={faClipboardList} className="icon" /> <span className="dropdown-text-stock">รายงานสินค้าคงเหลือ</span>
              </li>
              <li onClick={() => handleMenuClick("/reports/receipts", "ใบเสร็จ")}>
                <FontAwesomeIcon icon={faReceipt} className="icon" /> <span className="dropdown-text-receipt">ใบเสร็จ</span>
              </li>
              <li onClick={() => handleMenuClick("/reports/salehistory", "ประวัติการขาย")}>
                <FontAwesomeIcon icon={faHistory} className="icon" /> <span className="dropdown-text-historysale">ประวัติการขาย</span>
              </li>
            </ul>

            {/* เมนู: จัดการสินค้า */}
            <li className="item-dropdown" onClick={() => toggleDropdown("products")}>
              <FontAwesomeIcon icon={faBox} className="icon" /> <span className="menu-text-product">จัดการสินค้า</span>
              <FontAwesomeIcon icon={faCaretDown} className={`dropdown-icon ${openDropdown === "products" ? "open" : ""}`} />
            </li>
            <ul className={`item-details ${openDropdown === "products" ? "open" : ""} ${isSidebarOpen ? "" : "floating"}`}>
              <li onClick={() => handleMenuClick("/stocks", "สต็อกสินค้า")}>
                <FontAwesomeIcon icon={faClipboardList} className="icon" /> <span className="dropdown-text-stock">สต็อกสินค้า</span>
              </li>
              <li onClick={() => handleMenuClick("/createOrder", "นำเข้าสินค้าใหม่")}>
                <FontAwesomeIcon icon={faCartPlus} className="icon" /> <span className="dropdown-text-buyproduct">นำเข้าสินค้าใหม่</span>
              </li>
              <li onClick={() => handleMenuClick("/transfer", "โอนสินค้า")}>
                <FontAwesomeIcon icon={faExchangeAlt} className="icon" /> <span className="dropdown-text-tranfer">โอนสินค้า</span>
              </li>
              <li onClick={() => handleMenuClick("/products/scan", "บาร์โค้ด")}>
                <FontAwesomeIcon icon={faBarcode} className="icon" /> <span className="dropdown-text-barcode">บาร์โค้ด</span>
              </li>
              <li onClick={() => handleMenuClick("/debt", "ค้างชำระ")}>
                <FontAwesomeIcon icon={faScroll} className="icon" /> <span className="dropdown-text-debt">ค้างชำระ</span>
              </li>
              <li onClick={() => handleMenuClick("/expired", "สินค้าเหลือน้อย/สินค้าหมด")}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="icon" /> <span className="dropdown-text-expired">สินค้าเหลือน้อย</span>
              </li>
            </ul>
            {/* เมนู: เกี่ยวกับร้านค้า (แสดงเฉพาะถ้าไม่ใช่พนักงาน) */}
            {user?.role !== "employee" && (
              <>
                <li className="item-dropdown" onClick={() => toggleDropdown("setting")}>
                  <FontAwesomeIcon icon={faCog} className="icon" />
                  <span className="menu-text-aboutstore">เกี่ยวกับร้านค้า</span>
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className={`dropdown-icon ${openDropdown === "setting" ? "open" : ""}`}
                  />
                </li>
                <ul className={`item-details ${openDropdown === "setting" ? "open" : ""} ${isSidebarOpen ? "" : "floating"}`}>
                  <li onClick={() => handleMenuClick("/setting/employee", "ตั้งค่าพนักงาน")}>
                    <FontAwesomeIcon icon={faUserPlus} className="icon" />
                    <span className="dropdown-text-employee">พนักงาน</span>
                  </li>
                  <li onClick={() => handleMenuClick("/suppliers", "ผู้ตลิต")}>
                    <FontAwesomeIcon icon={faHandshake} className="icon" />
                    <span className="dropdown-text-suppliers">ผู้ผลิต</span>
                  </li>
                </ul>

              </>
            )}

          </ul>
        </div>
      </aside>

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
                    {lowStockItems.length > 0 && (
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
                            lowStockItems.map((item,index)=> (
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
                <button onClick={() => setIsLoginModalVisible(true)} className="login-button" name="login">
                  <FontAwesomeIcon icon={faSignInAlt} className="icon" /> <span>เข้าสู่ระบบ</span>
                </button>
                <button onClick={() => setIsRegisterModalVisible(true)} className="register-button" name="register">
                  <FontAwesomeIcon icon={faUserPlus} className="icon" /> <span>สมัครสมาชิก</span>
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