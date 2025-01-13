import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBox, faChartLine, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="logo">Product Management</div>
      <ul className="navLinks">
        <li onClick={() => handleNavigation("/")}>
          <FontAwesomeIcon icon={faHome} className="icon" /> หน้าหลัก
        </li>
        <li onClick={() => handleNavigation("/products")}>
          <FontAwesomeIcon icon={faBox} className="icon" /> จัดการสินค้า
        </li>
        <li onClick={() => handleNavigation("/analytics")}>
          <FontAwesomeIcon icon={faChartLine} className="icon" /> รายงาน
        </li>
        <li onClick={() => handleNavigation("/settings")}>
          <FontAwesomeIcon icon={faCog} className="icon" /> ตั้งค่า
        </li>
        <li onClick={() => handleNavigation("/logout")}>
          <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> ออกจากระบบ
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
