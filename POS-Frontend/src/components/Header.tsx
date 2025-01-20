import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faCircle,
  faShoppingCart,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faHome,
  faBox,
  faChartLine,
  faCog,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Sidebar.css";
import LoginPageModal from "./LoginPageModal.tsx";
import RegisterPageModal from "./RegisterPageModal.tsx";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null); // Add state for profile image
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false); // State for dropdown
  const navigate = useNavigate();

  // Toggle Sidebar Visibility
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

  // Toggle Login Modal
  const handleLoginModalToggle = () => {
    setIsLoginModalVisible(!isLoginModalVisible);
  };

  // Toggle Register Modal
  const handleRegisterModalToggle = () => {
    setIsRegisterModalVisible(!isRegisterModalVisible);
  };

  // Toggle Settings Dropdown
  const toggleSettingsDropdown = () => {
    setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
  };

  return (
    <>
      <button className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>

      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="logo">Product Management</div>

        {userEmail && isSidebarOpen && (
          <div className="userInfo">
            <div className="profilePicture">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="User Avatar"
                  className="avatar"
                />
              ) : (
                <div className="avatar-placeholder">No Image</div>
              )}
            </div>
            <div className="userDetails">
              <span className="userName">{username}</span>
              <span className="userRole">{userRole}</span>
              <span className="userStatus">
                <FontAwesomeIcon icon={faCircle} className="statusIcon" /> Online
              </span>
            </div>
          </div>
        )}

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
          <li onClick={() => handleNavigation("")}>
            <FontAwesomeIcon icon={faCog} className="icon" /> <span>ตั้งค่า</span>
            <FontAwesomeIcon
              icon={isSettingsDropdownOpen ? faChevronUp : faChevronDown}
              className="dropdownIcon"
              onClick={toggleSettingsDropdown}
            />
          </li>

          {isSettingsDropdownOpen && (
            <ul className="settingsDropdown">
              <li onClick={() => handleNavigation("/settings/personal-info")}>
                ข้อมูลส่วนตัว
              </li>
              <li onClick={() => handleNavigation("/settings/notifications")}>
                การแจ้งเตือน
              </li>
            </ul>
          )}

          <li onClick={() => handleNavigation("/shop")}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> <span>ซื้อสินค้า</span>
          </li>

          {!userEmail && !username && (
            <>
              <li onClick={handleLoginModalToggle}>
                <FontAwesomeIcon icon={faSignInAlt} className="icon" /> <span>เข้าสู่ระบบ</span>
              </li>
              <li onClick={handleRegisterModalToggle}>
                <FontAwesomeIcon icon={faUserPlus} className="icon" /> <span>สมัครสมาชิก</span>
              </li>
            </>
          )}
        </ul>

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
