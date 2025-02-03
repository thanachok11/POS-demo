import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faHome,
  faBox,
  faChartLine,
  faCog,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null); // Add state for profile image
  const navigate = useNavigate();

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

  // Effect to check user login status and update user info
  useEffect(() => {
    updateUserInfo();
    const handleStorageChange = () => updateUserInfo();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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

  // Handle Navigation to Different Pages
  const handleNavigation = (path: string) => {
    navigate(path);
  };


  // Toggle Register Modal
  const handleRegisterModalToggle = () => {
    setIsRegisterModalVisible(!isRegisterModalVisible);
  };

  return (
    <>
      <aside className="sidebar open">
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
      </aside>
    </>
  );
};

export default Sidebar;
