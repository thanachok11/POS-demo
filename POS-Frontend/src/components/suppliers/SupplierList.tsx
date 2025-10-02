import { useEffect, useState } from "react";
import { getSupplierData, deleteSupplier } from "../../api/suppliers/supplierApi";
import "../../styles/supplier/SupplierList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import SupplierForm from "./SupplierForm";
import React from "react";
import GlobalPopup from "../layout/GlobalPopup"; // ✅ ใช้ popup กลาง

interface Supplier {
    id?: number;
    _id?: string;
    companyName: string;
    phoneNumber: string;
    email: string;
    address: string;
    country: string;
    stateOrProvince: string;
    district: string;
    subDistrict: string;
    postalCode: string;
}

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // ✅ popup state
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ No token found");
            setLoading(false);
            return;
        }
        try {
            const response = await getSupplierData(token);
            if (Array.isArray(response)) {
                setSuppliers(response);
            } else if (response.data && Array.isArray(response.data)) {
                setSuppliers(response.data);
            } else {
                setError("❌ รูปแบบข้อมูลไม่ถูกต้อง");
            }
        } catch (error) {
            setError("❌ ไม่สามารถดึงข้อมูลซัพพลายเออร์ได้");
            console.error("API Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (supplier: Supplier) => {
        const id = supplier._id || supplier.id;
        if (!id) {
            console.error("❌ No supplier id found");
            return;
        }
        if (!window.confirm("คุณต้องการลบซัพพลายเออร์นี้ใช่หรือไม่?")) return;

        const token = localStorage.getItem("token");
        try {
            await deleteSupplier(id, token);
            setSuppliers((prev) => prev.filter((s) => s._id !== id && s.id !== id));
            setMessage("🗑️ ลบซัพพลายเออร์สำเร็จ!");
            setIsSuccess(true);
            setShowPopup(true);
        } catch (err) {
            console.error("Error deleting supplier:", err);
            setMessage("❌ เกิดข้อผิดพลาดในการลบซัพพลายเออร์");
            setIsSuccess(false);
            setShowPopup(true);
        }
    };

    const handleOpenModal = (supplier?: Supplier) => {
        setSelectedSupplier(supplier || null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSupplier(null);
    };

    // ✅ ฟิลเตอร์ก่อน paginate
    const filteredSuppliers = suppliers.filter((s) => {
        const searchText = searchQuery.toLowerCase();
        return (
            s.companyName?.toLowerCase().includes(searchText) ||
            s.phoneNumber?.toLowerCase().includes(searchText) ||
            s.email?.toLowerCase().includes(searchText) ||
            s.address?.toLowerCase().includes(searchText) ||
            s.subDistrict?.toLowerCase().includes(searchText) ||
            s.district?.toLowerCase().includes(searchText) ||
            s.stateOrProvince?.toLowerCase().includes(searchText) ||
            s.country?.toLowerCase().includes(searchText) ||
            s.postalCode?.toLowerCase().includes(searchText)
        );
    });

    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="display">
            <div className="supplier-container">
                {/* Header */}
                <div className="supplier-header-wrapper">
                    <h2 className="supplier-header">📋 รายชื่อซัพพลายเออร์</h2>

                    {loading && <p className="supplier-list-loading">⏳ กำลังโหลด...</p>}
                    {error && <p className="supplier-list-error">{error}</p>}

                    {/* Controls */}
                    <div className="supplier-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหาซัพพลายเออร์..."
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

                    {/* Add Button */}
                    <button className="supplier-add-btn" onClick={() => handleOpenModal()}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มซัพพลายเออร์
                    </button>
                </div>

                {/* Table */}
                <div className="supplier-table-wrapper">
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>ชื่อ</th>
                                <th>เบอร์โทร</th>
                                <th>อีเมล</th>
                                <th>ที่อยู่</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSuppliers.length > 0 ? (
                                currentSuppliers.map((supplier) => (
                                    <tr key={supplier._id || supplier.id}>
                                        <td>{supplier.companyName}</td>
                                        <td>{supplier.phoneNumber}</td>
                                        <td>{supplier.email}</td>
                                        <td>
                                            {supplier.address}, {supplier.subDistrict}, {supplier.district},{" "}
                                            {supplier.stateOrProvince}, {supplier.country} {supplier.postalCode}
                                        </td>
                                        <td>
                                            <div className="supplier-action-buttons">
                                                <button
                                                    className="supplier-edit-btn"
                                                    onClick={() => handleOpenModal(supplier)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="supplier-delete-btn"
                                                    onClick={() => handleDelete(supplier)}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="supplier-no-data">
                                        ❌ ไม่พบซัพพลายเออร์
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ◀ ก่อนหน้า
                    </button>
                    <span>
                        หน้า {currentPage} จาก {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        ถัดไป ▶
                    </button>
                </div>
            </div>

            {modalOpen && (
                <div className="supplier-modal-overlay">
                    <div className="supplier-modal-container">
                        <button className="modal-close" onClick={handleCloseModal}>
                            ✖
                        </button>
                        <SupplierForm
                            supplier={selectedSupplier}
                            onClose={handleCloseModal}
                            onSave={(success, msg) => {
                                fetchSuppliers();
                                setMessage(msg);
                                setIsSuccess(success);
                                setShowPopup(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ✅ GlobalPopup สำหรับ success/error */}
            <GlobalPopup
                message={message}
                isSuccess={isSuccess}
                show={showPopup}
                setShow={setShowPopup}
                onClose={() => {
                    // ✅ ให้ refresh หลังปิด popup
                    fetchSuppliers();
                    setModalOpen(false);
                    setSelectedSupplier(null);
                }}
            />

        </div>
    );
};

export default SupplierList;
