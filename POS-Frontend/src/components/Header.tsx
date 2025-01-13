import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faHome,
  faBox,
  faChartLine,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Sidebar.css";
import LoginPageModal from "./LoginPageModal.tsx";
import RegisterPageModal from "./RegisterPageModal.tsx";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginModalToggle = () => {
    setIsLoginModalVisible(!isLoginModalVisible);
  };

  const handleRegisterModalToggle = () => {
    setIsRegisterModalVisible(!isRegisterModalVisible);
  };

  const updateUserEmail = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedEmail = localStorage.getItem("userEmail");
      setUserEmail(storedEmail);
    } else {
      setUserEmail(null);
    }
  };

  useEffect(() => {
    // Initial check
    updateUserEmail();

    // Add event listener for storage changes
    const handleStorageChange = () => {
      updateUserEmail();
    };
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener when the component is unmounted
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <button className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="logo">Product Management</div>
        <ul className="navLinks">
          <li onClick={() => handleNavigation("/")}>
            <FontAwesomeIcon icon={faHome} className="icon" /> <span>หน้าหลัก</span>
          </li>
          <li onClick={() => handleNavigation("/products")}>
            <FontAwesomeIcon icon={faBox} className="icon" /> <span>จัดการสินค้า</span>
          </li>
          <li onClick={() => handleNavigation("/analytics")}>
            <FontAwesomeIcon icon={faChartLine} className="icon" /> <span>รายงาน</span>
          </li>
          <li onClick={() => handleNavigation("/settings")}>
            <FontAwesomeIcon icon={faCog} className="icon" /> <span>ตั้งค่า</span>
          </li>
        </ul>

        {/* User Info */}
        {userEmail && isSidebarOpen && (
          <div className="userInfo">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>สวัสดีคุณ {userEmail}</span>
          </div>
        )}

        {/* Logout Button */}
        {userEmail && (
          <div className="logoutSection">
            <button onClick={handleLogout} className="logoutButton">
              <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </aside>

      <LoginPageModal isVisible={isLoginModalVisible} onClose={handleLoginModalToggle} />
      <RegisterPageModal isVisible={isRegisterModalVisible} onClose={handleRegisterModalToggle} />
    </>
  );
};

export default Sidebar;
