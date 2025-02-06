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
  faClipboardList,

} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoginPageModal from "../auth/LoginPageModal.tsx";
import RegisterPageModal from "../auth/RegisterPageModal.tsx";
import "../../styles/Header.css";

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);  // ใช้ useState สำหรับ modal visibility
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);  // ใช้ useState สำหรับ modal visibility
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  // Get user info from token
  const getUserInfoFromToken = (token: string) => {
    const decoded: any = jwtDecode(token);
    setUsername(decoded.username);
    setUserEmail(decoded.email);
    setUserRole(decoded.role);
    setProfileImg(decoded.profile_img);
  };

  // Update user info based on localStorage
  const updateUserInfo = () => {
    const token = localStorage.getItem("token");
    if (token) {
      getUserInfoFromToken(token);
    } else {
      setUserEmail(null);
      setUsername(null);
      setUserRole(null);
      setProfileImg(null);
    }
  };

  useEffect(() => {
    updateUserInfo();
    const handleStorageChange = () => updateUserInfo();
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Toggle Login Modal
  const handleLoginModalToggle = () => {
    setIsLoginModalVisible(!isLoginModalVisible);
  };

  // Toggle Register Modal
  const handleRegisterModalToggle = () => {
    setIsRegisterModalVisible(!isRegisterModalVisible);
  };
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUserEmail(null);
    setUsername(null);
    setUserRole(null);
    setProfileImg(null);
    navigate("/");
  };

  return (
    <>
      <button className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>
    <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}></aside>
        <div className="sidebar open">
          <ul className="navLinks">
          <li onClick={() => handleNavigation("/")}>
            <FontAwesomeIcon icon={faHome} className="icon" /> <span>หน้าหลัก</span>
          </li>
          <li onClick={() => handleNavigation("/products")}>
            <FontAwesomeIcon icon={faBox} className="icon" /> <span>จัดการสินค้า</span>
          </li>
          <li onClick={() => handleNavigation("/dashboard")}>
            <FontAwesomeIcon icon={faChartLine} className="icon" /> <span>รายงาน</span>
          </li>
          <li onClick={() => handleNavigation("/stock")}>
            <FontAwesomeIcon icon={faClipboardList} className="icon" /> <span>สต็อกสินค้า</span>
          </li>
          <li onClick={() => handleNavigation("/setting")}>
            <FontAwesomeIcon icon={faCog} className="icon" /> <span>ตั้งค่า</span>
          </li>

          <li onClick={() => handleNavigation("/shop")}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> <span>ซื้อสินค้า</span>
          </li>
        </ul>
        </div>
      <nav className="navbar">
      <div className="navbar-content">
      <div className={`logo ${isSidebarOpen ? "shifted" : ""}`}>ระบบจัดการสินค้า</div>
        <div className="nav-right">
          {userEmail && (
            <>
              <FontAwesomeIcon icon={faBell} className="icon notification-icon" />
              {/* User Dropdown */}
              <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-info">
                  <img src={profileImg || "default-avatar.png"} alt="User" className="avatar" />
                  <div className="user-details">
                    <span className="username">{username}</span>
                    <span className="status-online">🟢 กำลังออนไลน์</span>
                  </div>
                  <FontAwesomeIcon icon={faCaretDown} className="icon caret-icon" />
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <p className="user-role">👤 Role: {userRole}</p>
                    <button onClick={handleLogout} className="logout-button">
                      <FontAwesomeIcon icon={faSignOutAlt} className="icon logout-icon" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {/* ถ้ายังไม่ได้ล็อกอิน แสดงปุ่มเข้าสู่ระบบ/สมัครสมาชิก */}
          {!userEmail && !username && (
            <>
              <li onClick={handleLoginModalToggle}>
                <FontAwesomeIcon icon={faSignInAlt} className="icon" /> <span >เข้าสู่ระบบ</span>
              </li>
              <li onClick={handleRegisterModalToggle}>
                <FontAwesomeIcon icon={faUserPlus} className="icon" /> <span >สมัครสมาชิก</span>
              </li>
            </>
          )}
        </div>
      </div>

      {/* แสดง Login และ Register Modal */}
      <LoginPageModal isVisible={isLoginModalVisible} onClose={handleLoginModalToggle} />
      <RegisterPageModal isVisible={isRegisterModalVisible} onClose={handleRegisterModalToggle} />
    </nav>
    </>
  );
};

export default Navbar;
