import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faCaretDown,
    faShoppingCart,
    faChartLine,
    faFileInvoice,
    faClipboardList,
    faReceipt,
    faHistory,
    faBox,
    faCartPlus,
    faBarcode,
    faScroll,
    faExclamationTriangle,
    faCog,
    faUserPlus,
    faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/layout/Sidebar.css";

interface SidebarProps {
    isSidebarOpen: boolean;
    openDropdown: string | null;
    toggleDropdown: (menu: string) => void;
    handleMenuClick: (path: string, menuName: string) => void;
    user: {
        role: string;
        nameStore: string;
    } | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    openDropdown,
    toggleDropdown,
    handleMenuClick,
    user,
}) => {
    return (
        <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
            {/* ส่วนแสดงชื่อร้าน */}
            <div className="sidebar-header">
                <span className="sidebar-logo-text">{user?.nameStore || "EAZYPOS"}</span>
            </div>

            <div className="sidebar-scrollable">
                {/* เมนูหลัก */}
                <ul className="navLinks">
                    {/* เมนู: หน้าหลัก */}
                    <li className="item-dropdown" onClick={() => toggleDropdown("management")}>
                        <FontAwesomeIcon icon={faHome} className="icon" />
                        <span className="menu-text-home">หน้าหลัก</span>
                        <FontAwesomeIcon
                            icon={faCaretDown}
                            className={`dropdown-icon ${openDropdown === "management" ? "open" : ""}`}
                        />
                    </li>
                    <ul
                        className={`item-details ${openDropdown === "management" ? "open" : ""} ${isSidebarOpen ? "" : "floating"
                            }`}
                    >
                        <li onClick={() => handleMenuClick("/shop", "ซื้อสินค้า")}>
                            <FontAwesomeIcon icon={faShoppingCart} className="icon" />{" "}
                            <span className="dropdown-text-buy">ซื้อสินค้า</span>
                        </li>
                    </ul>

                    {/* เมนู: รายงาน */}
                    <li className="item-dropdown" onClick={() => toggleDropdown("reports")}>
                        <FontAwesomeIcon icon={faChartLine} className="icon" />{" "}
                        <span className="menu-text-dashboard">รายงาน</span>
                        <FontAwesomeIcon
                            icon={faCaretDown}
                            className={`dropdown-icon ${openDropdown === "reports" ? "open" : ""}`}
                        />
                    </li>
                    <ul
                        className={`item-details ${openDropdown === "reports" ? "open" : ""} ${isSidebarOpen ? "" : "floating"
                            }`}
                    >
                        <li onClick={() => handleMenuClick("/reports/sales", "รายงานยอดขาย")}>
                            <FontAwesomeIcon icon={faFileInvoice} className="icon" />{" "}
                            <span className="dropdown-text-sale">รายงานยอดขาย</span>
                        </li>
                        <li onClick={() => handleMenuClick("/reports/stock", "รายงานสินค้าคงเหลือ")}>
                            <FontAwesomeIcon icon={faClipboardList} className="icon" />{" "}
                            <span className="dropdown-text-stock">รายงานสินค้าคงเหลือ</span>
                        </li>
                        <li onClick={() => handleMenuClick("/reports/receipts", "ใบเสร็จ")}>
                            <FontAwesomeIcon icon={faReceipt} className="icon" />{" "}
                            <span className="dropdown-text-receipt">ใบเสร็จ</span>
                        </li>
                        <li onClick={() => handleMenuClick("/reports/salehistory", "ประวัติการขาย")}>
                            <FontAwesomeIcon icon={faHistory} className="icon" />{" "}
                            <span className="dropdown-text-historysale">ประวัติการขาย</span>
                        </li>
                    </ul>

                    {/* เมนู: จัดการสินค้า */}
                    <li className="item-dropdown" onClick={() => toggleDropdown("products")}>
                        <FontAwesomeIcon icon={faBox} className="icon" />{" "}
                        <span className="menu-text-product">จัดการสินค้า</span>
                        <FontAwesomeIcon
                            icon={faCaretDown}
                            className={`dropdown-icon ${openDropdown === "products" ? "open" : ""}`}
                        />
                    </li>
                    <ul
                        className={`item-details ${openDropdown === "products" ? "open" : ""} ${isSidebarOpen ? "" : "floating"
                            }`}
                    >
                        <li onClick={() => handleMenuClick("/stocks", "สต็อกสินค้า")}>
                            <FontAwesomeIcon icon={faClipboardList} className="icon" />{" "}
                            <span className="dropdown-text-stock">สต็อกสินค้า</span>
                        </li>
                        <li onClick={() => handleMenuClick("/createOrder", "นำเข้าสินค้าใหม่")}>
                            <FontAwesomeIcon icon={faCartPlus} className="icon" />{" "}
                            <span className="dropdown-text-buyproduct">นำเข้าสินค้าใหม่</span>
                        </li>
                        <li onClick={() => handleMenuClick("/barcode", "บาร์โค้ด")}>
                            <FontAwesomeIcon icon={faBarcode} className="icon" />{" "}
                            <span className="dropdown-text-barcode">บาร์โค้ด</span>
                        </li>
                        <li onClick={() => handleMenuClick("/debt", "ค้างชำระ")}>
                            <FontAwesomeIcon icon={faScroll} className="icon" />{" "}
                            <span className="dropdown-text-debt">ค้างชำระ</span>
                        </li>
                        <li onClick={() => handleMenuClick("/expired", "สินค้าเหลือน้อย/สินค้าหมด")}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />{" "}
                            <span className="dropdown-text-expired">สินค้าเหลือน้อย</span>
                        </li>
                    </ul>

                    {/* เมนู: เกี่ยวกับร้านค้า (เฉพาะไม่ใช่ employee) */}
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
                            <ul
                                className={`item-details ${openDropdown === "setting" ? "open" : ""} ${isSidebarOpen ? "" : "floating"
                                    }`}
                            >
                                <li onClick={() => handleMenuClick("/setting/employee", "ตั้งค่าพนักงาน")}>
                                    <FontAwesomeIcon icon={faUserPlus} className="icon" />{" "}
                                    <span className="dropdown-text-employee">พนักงาน</span>
                                </li>
                                <li onClick={() => handleMenuClick("/suppliers", "ผู้ตลิต")}>
                                    <FontAwesomeIcon icon={faHandshake} className="icon" />{" "}
                                    <span className="dropdown-text-suppliers">ผู้ผลิต</span>
                                </li>
                            </ul>
                        </>
                    )}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
