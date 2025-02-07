import React, { useState, useEffect } from "react";
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
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoginPageModal from "../auth/LoginPageModal.tsx";
import RegisterPageModal from "../auth/RegisterPageModal.tsx";
import "../../styles/Header.css";

interface NavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<NavbarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [user, setUser] = useState<{ username: string; email: string; role: string; profileImg: string } | null>(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          profileImg: decoded.profile_img || "default-avatar.png",
        });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

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
        <ul className="navLinks">
          {[
            { path: "/", icon: faHome, label: "หน้าหลัก" },
            { path: "/products", icon: faBox, label: "จัดการสินค้า" },
            { path: "/dashboard", icon: faChartLine, label: "รายงาน" },
            { path: "/stock", icon: faClipboardList, label: "สต็อกสินค้า" },
            { path: "/setting", icon: faCog, label: "ตั้งค่า" },
            { path: "/shop", icon: faShoppingCart, label: "ซื้อสินค้า" },
          ].map((item) => (
            <li key={item.path} onClick={() => navigate(item.path)}>
              <FontAwesomeIcon icon={item.icon} className="icon" /> <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className={`logo ${isSidebarOpen ? "shifted" : ""}`}>ระบบจัดการสินค้า</div>
          <div className="nav-right">
            {user ? (
              <>
                <FontAwesomeIcon icon={faBell} className="icon notification-icon" />
                <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-info">
                    <img src={user.profileImg} alt="User" className="avatar" />
                    <div className="user-details">
                      <span className="username">{user.username}</span>
                      <span className="status-online">🟢 กำลังออนไลน์</span>
                    </div>
                    <FontAwesomeIcon icon={faCaretDown} className="icon caret-icon" />
                  </div>
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <p className="user-role">👤 Role: {user.role}</p>
                      <button onClick={handleLogout} className="logout-button">
                        <FontAwesomeIcon icon={faSignOutAlt} className="icon logout-icon" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setIsLoginModalVisible(true)} className="auth-button">
                  <FontAwesomeIcon icon={faSignInAlt} className="icon" /> <span>เข้าสู่ระบบ</span>
                </button>
                <button onClick={() => setIsRegisterModalVisible(true)} className="auth-button">
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
