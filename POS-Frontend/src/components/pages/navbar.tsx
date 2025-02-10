import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faShoppingCart,
  faHome,
  faBox,
  faCaretDown,
  faClipboardList,
  faCartPlus,
  faExchangeAlt,
  faBarcode,
  faMoneyBillWave,
  faExclamationTriangle,
  faChartLine,
  faFileInvoice,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/page/test.css";
import React from "react";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleMenuClick = (path: string, title: string) => {
    console.log(`Navigating to ${path} - ${title}`);
  };

  return (
    <>
      {/* ปุ่ม Toggle Sidebar */}
      <button className={`toggleButton ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <span className="sidebar-logo-text">POS ระบบจัดการสินค้า</span>
        <ul className="navLinks">
          <li onClick={() => handleMenuClick("/shop", "ซื้อสินค้า")}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> <span>ซื้อสินค้า</span>
          </li>
          <li onClick={() => handleMenuClick("/", "หน้าหลัก")}>
            <FontAwesomeIcon icon={faHome} className="icon" /> <span>หน้าหลัก</span>
          </li>

          {/* Dropdown: จัดการสินค้า */}
          <li className="item-dropdown" onClick={() => toggleDropdown("products")}>
            <FontAwesomeIcon icon={faBox} className="icon" /> <span>จัดการสินค้า</span>
            <FontAwesomeIcon icon={faCaretDown} className={`dropdown-icon ${openDropdown === "products" ? "open" : ""}`} />
          </li>
          <ul className={`item-details ${openDropdown === "products" ? "open" : ""}`}>
            <li onClick={() => handleMenuClick("/stock", "สต็อกสินค้า")}>
              <FontAwesomeIcon icon={faClipboardList} className="icon" /> <span>สต็อกสินค้า</span>
            </li>
            <li onClick={() => handleMenuClick("/buynewproduct", "ซื้อสินค้าใหม่")}>
              <FontAwesomeIcon icon={faCartPlus} className="icon" /> <span>ซื้อสินค้าใหม่</span>
            </li>
          </ul>

          {/* Dropdown: รายงาน */}
          <li className="item-dropdown" onClick={() => toggleDropdown("reports")}>
            <FontAwesomeIcon icon={faChartLine} className="icon" /> <span>รายงาน</span>
            <FontAwesomeIcon icon={faCaretDown} className={`dropdown-icon ${openDropdown === "reports" ? "open" : ""}`} />
          </li>
          <ul className={`item-details ${openDropdown === "reports" ? "open" : ""}`}>
            <li onClick={() => handleMenuClick("/reports/sales", "รายงานยอดขาย")}>
              <FontAwesomeIcon icon={faFileInvoice} className="icon" /> รายงานยอดขาย
            </li>
          </ul>

          <li onClick={() => handleMenuClick("/setting/store", "ตั้งค่าร้านค้า")}>
            <FontAwesomeIcon icon={faCog} className="icon" /> <span>ตั้งค่าร้านค้า</span>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
