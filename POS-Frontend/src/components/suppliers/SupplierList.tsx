import { useEffect, useState } from "react";
import { getSupplierData, deleteSupplier } from "../../api/suppliers/supplierApi";
import "../../styles/supplier/SupplierList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import SupplierForm from "./SupplierForm";
import { useGlobalPopup } from "../../components/common/GlobalPopupEdit";

interface Supplier {
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
    code?: string;
}

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const { showPopup, closePopup } = useGlobalPopup();

    // โหลดข้อมูลซัพพลายเออร์
    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ ไม่มีโทเคน");
            setLoading(false);
            return;
        }

        try {
            const res = await getSupplierData(token);
            const data = res.data || res;
            if (Array.isArray(data)) {
                setSuppliers(data);
            } else {
                setError("⚠️ รูปแบบข้อมูลไม่ถูกต้อง");
            }
        } catch (err) {
            setError("❌ ไม่สามารถโหลดข้อมูลซัพพลายเออร์ได้");
            console.error("getSupplierData error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (supplier: Supplier) => {
        if (!supplier._id) return;

        showPopup({
            type: "confirm",
            message: `คุณต้องการลบซัพพลายเออร์ "${supplier.companyName}" ใช่หรือไม่?`,
            onConfirm: async () => {
                const token = localStorage.getItem("token");
                try {
                    await deleteSupplier(supplier._id!, token!);
                    setSuppliers((prev) => prev.filter((s) => s._id !== supplier._id));

                    closePopup();
                    showPopup({
                        type: "success",
                        message: "🗑️ ลบซัพพลายเออร์สำเร็จ!",
                        onClose: () => fetchSuppliers(),
                    });
                } catch (err: any) {
                    closePopup();

                    // ✅ แสดงข้อความจริงจาก backend
                    const backendMsg =
                        err?.response?.data?.message ||
                        err?.response?.data?.error ||
                        "❌ เกิดข้อผิดพลาดในการลบซัพพลายเออร์";

                    showPopup({
                        type: "error",
                        message: backendMsg,
                    });

                    console.error("❌ deleteSupplier Error:", backendMsg);
                }
            },
        });
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
        const search = searchQuery.toLowerCase();
        return (
            s.companyName?.toLowerCase().includes(search) ||
            s.phoneNumber?.toLowerCase().includes(search) ||
            s.email?.toLowerCase().includes(search) ||
            s.address?.toLowerCase().includes(search) ||
            s.subDistrict?.toLowerCase().includes(search) ||
            s.district?.toLowerCase().includes(search) ||
            s.stateOrProvince?.toLowerCase().includes(search) ||
            s.country?.toLowerCase().includes(search) ||
            s.postalCode?.toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="display">
            <div className="supplier-container">
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
                            <label>แสดง:</label>
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
                            <span> รายการ</span>
                        </div>
                    </div>

                    <button className="supplier-add-btn" onClick={() => handleOpenModal()}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มซัพพลายเออร์
                    </button>
                </div>

                {/* Table */}
                <div className="supplier-table-wrapper">
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ชื่อ</th>
                                <th>เบอร์โทร</th>
                                <th>อีเมล</th>
                                <th>ที่อยู่</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSuppliers.length > 0 ? (
                                currentSuppliers.map((s) => (
                                    <tr key={s._id}>
                                        <td>{s.code || "-"}</td>
                                        <td>{s.companyName}</td>
                                        <td>{s.phoneNumber}</td>
                                        <td>{s.email}</td>
                                        <td>
                                            {s.address}, {s.subDistrict}, {s.district},{" "}
                                            {s.stateOrProvince}, {s.country} {s.postalCode}
                                        </td>
                                        <td>
                                            <div className="supplier-action-buttons">
                                                <button
                                                    className="supplier-edit-btn"
                                                    onClick={() => handleOpenModal(s)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="supplier-delete-btn"
                                                    onClick={() => handleDelete(s)}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="supplier-no-data">
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
                            onSave={() => {
                                fetchSuppliers();
                                showPopup({
                                    type: "success",
                                    message: "✅ บันทึกซัพพลายเออร์สำเร็จ!",
                                    onClose: () => setModalOpen(false),
                                });
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierList;
