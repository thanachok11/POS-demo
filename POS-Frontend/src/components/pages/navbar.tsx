import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSignOutAlt, faSignInAlt, faUserPlus,faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoginPageModal from "../auth/LoginPageModal.tsx";
import RegisterPageModal from "../auth/RegisterPageModal.tsx";
import "../../styles/Navbar.css";

const Navbar: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);  // ใช้ useState สำหรับ modal visibility
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);  // ใช้ useState สำหรับ modal visibility
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  // Get user info from token
  const getUserInfoFromToken = (token: string) => {
    const decoded: any = jwtDecode(token);
    setUsername(decoded.username);
    setUserEmail(decoded.email);
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
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">ระบบจัดการสินค้า</div>
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
                    <p className="user-role">👤 Role: {userRole || "User"}</p>
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
  );
};

export default Navbar;
