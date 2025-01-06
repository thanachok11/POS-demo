import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "../styles/Navbar.css";
import LoginPageModal from "./LoginPageModal.tsx"; // Ensure these are implemented
import RegisterPageModal from "./RegisterPageModal.tsx"; // and imported correctly

const Navbar: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleLoginModalToggle = () => {
    setIsLoginModalVisible(!isLoginModalVisible);
  };

  const handleRegisterModalToggle = () => {
    setIsRegisterModalVisible(!isRegisterModalVisible);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedEmail = localStorage.getItem("userEmail");
      setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    window.location.href = "/";
  };

  return (
    <header>
      <nav className="navbar">
        <a href="/dashboard" className="link">
          <div className="logo">Product Management</div>
        </a>
        <ul className="navLinks">
          {userEmail ? (
            <>
              <li>
                <span className="userEmail">
                  <FontAwesomeIcon icon={faUser} /> สวัสดีคุณ {userEmail}
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="logoutButton">
                  <FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <a className="login" onClick={handleLoginModalToggle}>
                  <FontAwesomeIcon icon={faSignInAlt} /> เข้าสู่ระบบ
                </a>
              </li>
              <li>
                <a className="register" onClick={handleRegisterModalToggle}>
                  <FontAwesomeIcon icon={faUserPlus} /> สมัครสมาชิก
                </a>
              </li>
            </>
          )}
        </ul>
        <LoginPageModal isVisible={isLoginModalVisible} onClose={handleLoginModalToggle} />
        <RegisterPageModal isVisible={isRegisterModalVisible} onClose={handleRegisterModalToggle} />
      </nav>
    </header>
  );
};

export default Navbar;
