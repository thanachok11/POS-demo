import React, { useEffect, useState } from "react";
import {
    getDiscounts,
    createDiscount,
    deleteDiscount,
    updateDiscount, // ✅ เพิ่ม
} from "../../api/payment/discountApi";
import GlobalPopup from "../layout/GlobalPopup";
import DiscountModal from "./DiscountModal";
import Pagination from "../stock/component/Pagination";
import "../../styles/payment/DiscountPage.css";

interface Discount {
    _id: string;
    code: string;
    type: "percent" | "baht";
    value: number;
    description?: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
}

const DiscountPage: React.FC = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<Discount | null>(null); // ✅ new
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        isSuccess: true,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const token = localStorage.getItem("token");

    // ✅ โหลดข้อมูลส่วนลด
    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            if (!token) throw new Error("Token not found");
            const response = await getDiscounts(token);
            const discountsData = Array.isArray(response)
                ? response
                : Array.isArray(response.data)
                    ? response.data
                    : [];
            setDiscounts(discountsData);
        } catch (err) {
            console.error("โหลดข้อมูลส่วนลดล้มเหลว:", err);
            setPopup({
                show: true,
                message: "❌ โหลดข้อมูลส่วนลดไม่สำเร็จ",
                isSuccess: false,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    // ✅ เพิ่มส่วนลดใหม่
    const handleCreateDiscount = async (formData: any) => {
        try {
            if (!token) throw new Error("Token not found");
            const res = await createDiscount(formData, token);
            const msg = res?.message || "สร้างรหัสส่วนลดสำเร็จ!";
            fetchDiscounts();
            setModalOpen(false);
            setEditData(null);
            setPopup({
                show: true,
                message: msg,
                isSuccess: true,
            });
        } catch (err: any) {
            console.error("❌ สร้างส่วนลดล้มเหลว:", err);
            const errorMsg =
                err?.response?.data?.message || "❌ ไม่สามารถสร้างรหัสส่วนลดได้";
            setPopup({
                show: true,
                message: errorMsg,
                isSuccess: false,
            });
        }
    };

    // ✅ แก้ไขส่วนลด
    const handleUpdateDiscount = async (formData: any) => {
        if (!editData) return;
        try {
            if (!token) throw new Error("Token not found");
            const res = await updateDiscount(editData._id, formData, token);
            const msg = res?.message || "อัปเดตรหัสส่วนลดสำเร็จ!";
            fetchDiscounts();
            setModalOpen(false);
            setEditData(null);
            setPopup({
                show: true,
                message: msg,
                isSuccess: true,
            });
        } catch (err: any) {
            console.error("❌ อัปเดตส่วนลดล้มเหลว:", err);
            const errorMsg =
                err?.response?.data?.message || "❌ ไม่สามารถอัปเดตรหัสส่วนลดได้";
            setPopup({
                show: true,
                message: errorMsg,
                isSuccess: false,
            });
        }
    };

    // ✅ ลบส่วนลด
    const handleDelete = async (id: string) => {
        if (confirm("ต้องการลบรหัสส่วนลดนี้หรือไม่?")) {
            try {
                if (!token) throw new Error("Token not found");
                const res = await deleteDiscount(id, token);
                const msg = res?.message || "ลบรหัสส่วนลดเรียบร้อยแล้ว!";
                fetchDiscounts();
                setPopup({
                    show: true,
                    message: msg,
                    isSuccess: true,
                });
            } catch (err: any) {
                console.error("ลบส่วนลดไม่สำเร็จ:", err);
                const errorMsg =
                    err?.response?.data?.message || "❌ ไม่สามารถลบรหัสส่วนลดได้";
                setPopup({
                    show: true,
                    message: errorMsg,
                    isSuccess: false,
                });
            }
        }
    };

    // 🔍 Filter + Pagination
    const filteredDiscounts = discounts.filter(
        (d) =>
            d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.description &&
                d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
    const paginatedDiscounts = filteredDiscounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="display">
            <div className="discount-container">
                <div className="payment-header-wrapper">
                    <h1 className="payment-header">🎟️ รายการรหัสส่วนลด</h1>

                    {loading && <p className="payment-loading">กำลังโหลดข้อมูล...</p>}

                    {/* 🔍 Search & Controls */}
                    <div className="stock-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหา รหัสส่วนลด / คำอธิบาย..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="items-per-page">
                            <label>แสดง: </label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            <span> รายการต่อหน้า</span>
                        </div>
                    </div>

                    {/* ✅ ปุ่มเพิ่มส่วนลด */}
                    <div className="discount-action-bar">
                        <button
                            className="discount-btn-add"
                            onClick={() => {
                                setEditData(null);
                                setModalOpen(true);
                            }}
                        >
                            ➕ เพิ่มรหัสส่วนลด
                        </button>
                    </div>
                </div>

                {/* ✅ ตารางข้อมูล */}
                <div className="discount-list-section">
                    {paginatedDiscounts.length > 0 ? (
                        <table className="discount-table">
                            <thead>
                                <tr>
                                    <th>รหัส</th>
                                    <th>ประเภท</th>
                                    <th>มูลค่า</th>
                                    <th>คำอธิบาย</th>
                                    <th>วันที่เริ่ม</th>
                                    <th>หมดอายุ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDiscounts.map((d) => (
                                    <tr key={d._id}>
                                        <td className="discount-code">{d.code}</td>
                                        <td>{d.type === "percent" ? "เปอร์เซ็นต์" : "บาท"}</td>
                                        <td>
                                            {d.type === "percent"
                                                ? `${d.value}%`
                                                : `${d.value.toLocaleString()} ฿`}
                                        </td>
                                        <td>{d.description || "-"}</td>
                                        <td>
                                            {d.startDate
                                                ? new Date(d.startDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td>
                                            {d.endDate
                                                ? new Date(d.endDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="discount-actions">
                                            <button
                                                className="discount-btn-edit"
                                                onClick={() => {
                                                    setEditData(d);
                                                    setModalOpen(true);
                                                }}
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                className="discount-btn-delete"
                                                onClick={() => handleDelete(d._id)}
                                            >
                                                ลบ
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="discount-no-data">ยังไม่มีรหัสส่วนลด</p>
                    )}
                </div>

                {/* ✅ Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                )}

                {/* ✅ Global Popup */}
                <GlobalPopup
                    message={popup.message}
                    isSuccess={popup.isSuccess}
                    show={popup.show}
                    setShow={(val) => setPopup((prev) => ({ ...prev, show: val }))}
                />

                {/* 🧩 Modal (เพิ่ม / แก้ไข) */}
                {modalOpen && (
                    <DiscountModal
                        onClose={() => {
                            setModalOpen(false);
                            setEditData(null);
                        }}
                        onSubmit={editData ? handleUpdateDiscount : handleCreateDiscount}
                        loading={loading}
                        editData={editData}
                    />
                )}
            </div>
        </div>
    );
};

export default DiscountPage;
