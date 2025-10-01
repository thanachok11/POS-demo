import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

interface Warehouse {
    _id: string;
    name?: string;
    location?: string;
}

interface Category {
    _id: string;
    name: string;
}

interface Supplier {
    _id: string;
    companyName: string;
}

interface FilterControlProps {
    selectedStatuses: string[];
    setSelectedStatuses: (v: string[]) => void;
    selectedWarehouses: string[];
    setSelectedWarehouses: (v: string[]) => void;
    selectedCategories: string[];
    setSelectedCategories: (v: string[]) => void;
    selectedSuppliers: string[];
    setSelectedSuppliers: (v: string[]) => void;
    selectedExpiry: string[];
    setSelectedExpiry: (v: string[]) => void;
    activeFilter: ("active" | "inactive")[];
    setActiveFilter: (v: ("active" | "inactive")[]) => void;
    warehouses: Warehouse[];
    categories: Category[];
    suppliers: Supplier[];
}

const FilterControl: React.FC<FilterControlProps> = ({
    selectedStatuses, setSelectedStatuses,
    selectedWarehouses, setSelectedWarehouses,
    selectedCategories, setSelectedCategories,
    selectedSuppliers, setSelectedSuppliers,
    selectedExpiry, setSelectedExpiry,
    activeFilter, setActiveFilter,
    warehouses, categories, suppliers
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // ✅ toggle ค่า checkbox
    const toggleValue = (list: string[], setList: (v: string[]) => void, value: string) => {
        if (list.includes(value)) {
            setList(list.filter(v => v !== value));
        } else {
            setList([...list, value]);
        }
    };

    // ✅ toggle เปิดปิด dropdown ย่อย
    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    // ✅ นับจำนวน filter ที่ active
    const activeCount = useMemo(() => {
        let count = 0;
        if (selectedStatuses.length > 0) count++;
        if (selectedWarehouses.length > 0) count++;
        if (selectedCategories.length > 0) count++;
        if (selectedSuppliers.length > 0) count++;
        if (selectedExpiry.length > 0) count++;
        if (activeFilter.length > 0) count++;
        return count;
    }, [
        selectedStatuses,
        selectedWarehouses,
        selectedCategories,
        selectedSuppliers,
        selectedExpiry,
        activeFilter,
    ]);

    return (
        <div className="filter-control">
            {/* ปุ่ม filter */}
            <button
                className="filter-toggle-btn"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <FontAwesomeIcon icon={faFilter} /> กรอง
                {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
            </button>

            {/* Dropdown หลัก */}
            {isOpen && (
                <div className="filter-bar-dropdown">

                    {/* ✅ สถานะสินค้า */}
                    <div className="filter-dropdown">
                        <div className="filter-label" onClick={() => toggleDropdown("status")}>
                            สถานะสินค้า ⌄
                        </div>
                        {openDropdown === "status" && (
                            <div className="filter-options">
                                {["สินค้าพร้อมขาย", "สินค้าหมด", "สินค้าเหลือน้อย", "low10"].map((status) => (
                                    <label key={status} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => toggleValue(selectedStatuses, setSelectedStatuses, status)}
                                        />
                                        {status}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ คลังสินค้า */}
                    <div className="filter-dropdown">
                        <div className="filter-label" onClick={() => toggleDropdown("warehouse")}>
                            คลังสินค้า ⌄
                        </div>
                        {openDropdown === "warehouse" && (
                            <div className="filter-options">
                                {warehouses.map((w) => (
                                    <label key={w._id} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedWarehouses.includes(w._id)}
                                            onChange={() => toggleValue(selectedWarehouses, setSelectedWarehouses, w._id)}
                                        />
                                        {w.name || w.location}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ หมวดหมู่ */}
                    <div className="filter-dropdown">
                        <div className="filter-label" onClick={() => toggleDropdown("category")}>
                            หมวดหมู่ ⌄
                        </div>
                        {openDropdown === "category" && (
                            <div className="filter-options">
                                {categories.map((cat) => (
                                    <label key={cat._id} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat._id)}
                                            onChange={() => toggleValue(selectedCategories, setSelectedCategories, cat._id)}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ ซัพพลายเออร์ */}
                    <div className="filter-dropdown">
                        <div className="filter-label" onClick={() => toggleDropdown("supplier")}>
                            ซัพพลายเออร์ ⌄
                        </div>
                        {openDropdown === "supplier" && (
                            <div className="filter-options">
                                {suppliers.map((s) => (
                                    <label key={s._id} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedSuppliers.includes(s._id)}
                                            onChange={() => toggleValue(selectedSuppliers, setSelectedSuppliers, s._id)}
                                        />
                                        {s.companyName}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ วันหมดอายุ */}
                    <div className="filter-dropdown">
                        <div className="filter-label" onClick={() => toggleDropdown("expiry")}>
                            วันหมดอายุ ⌄
                        </div>
                        {openDropdown === "expiry" && (
                            <div className="filter-options">
                                {["expired", "nearExpiry"].map((exp) => (
                                    <label key={exp} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedExpiry.includes(exp)}
                                            onChange={() => toggleValue(selectedExpiry, setSelectedExpiry, exp)}
                                        />
                                        {exp === "expired" ? "หมดอายุแล้ว ⏳" : "ใกล้หมดอายุ (30 วัน) ⚡"}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ Active / Inactive */}
                    <div className="filter-dropdown">
                        <div className="filter-label" onClick={() => toggleDropdown("active")}>
                            สถานะการใช้งาน ⌄
                        </div>
                        {openDropdown === "active" && (
                            <div className="filter-options">
                                {["active", "inactive"].map((status) => (
                                    <label key={status} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={activeFilter.includes(status as "active" | "inactive")}
                                            onChange={() => {
                                                if (activeFilter.includes(status as "active" | "inactive")) {
                                                    setActiveFilter(activeFilter.filter((v) => v !== status));
                                                } else {
                                                    setActiveFilter([...activeFilter, status as "active" | "inactive"]);
                                                }
                                            }}
                                        />
                                        {status === "active" ? "กำลังใช้งาน 🟢" : "เลิกใช้งาน 🔴"}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterControl;
