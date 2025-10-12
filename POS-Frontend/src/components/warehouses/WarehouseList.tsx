import { useEffect, useState } from "react";
import { getWarehouseData, deleteWarehouse } from "../../api/warehouse/warehouseApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import WarehouseForm from "./WarehouseForm";
import { useGlobalPopup } from "../../components/common/GlobalPopupEdit";

import "../../styles/warehouse/WarehouseList.css";
interface Warehouse {
    _id?: string;
    name: string;
    code: string;
    location: string;
    description?: string;
}

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { showPopup, closePopup } = useGlobalPopup();

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ No token found");
            setLoading(false);
            return;
        }
        try {
            const response = await getWarehouseData(token);
            if (Array.isArray(response)) setWarehouses(response);
            else if (response.data && Array.isArray(response.data))
                setWarehouses(response.data);
            else setError("❌ รูปแบบข้อมูลไม่ถูกต้อง");
        } catch (error) {
            setError("❌ ไม่สามารถดึงข้อมูลคลังสินค้าได้");
            console.error("API Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (warehouse: Warehouse) => {
        if (!warehouse._id) return;

        showPopup({
            type: "confirm",
            message: `คุณต้องการลบคลัง "${warehouse.name}" ใช่หรือไม่?`,
            onConfirm: async () => {
                const token = localStorage.getItem("token");
                try {
                    await deleteWarehouse(warehouse._id!, token!);

                    // ✅ ลบสำเร็จ → อัปเดต state
                    setWarehouses((prev) => prev.filter((w) => w._id !== warehouse._id));

                    closePopup();
                    showPopup({
                        type: "success",
                        message: "✅ ลบคลังสำเร็จ!",
                        onClose: () => fetchWarehouses(),
                    });
                } catch (err: any) {
                    const msg = err?.error || "❌ ลบไม่สำเร็จ";
                    showPopup({ type: "error", message: msg });
                }
            },
        });
    };


    const handleOpenModal = (warehouse?: Warehouse) => {
        setSelectedWarehouse(warehouse || null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedWarehouse(null);
    };

    const filtered = warehouses.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const current = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="display">
            <div className="warehouse-container">
                <div className="warehouse-header-wrapper">
                    <h2 className="warehouse-header">🏠 รายชื่อคลังสินค้า</h2>

                    {loading && <p className="warehouse-loading">⏳ กำลังโหลด...</p>}
                    {error && <p className="warehouse-error">{error}</p>}

                    <div className="warehouse-controls">
                        <input
                            type="text"
                            placeholder="🔍 ค้นหาคลัง..."
                            className="warehouse-search-input"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="warehouse-page-size">
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
                            <span> รายการ</span>
                        </div>
                    </div>

                    <button className="warehouse-add-btn" onClick={() => handleOpenModal()}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มคลังสินค้า
                    </button>
                </div>

                {/* Table */}
                <div className="warehouse-table-wrapper">
                    <table className="warehouse-table">
                        <thead>
                            <tr>
                                <th>รหัสคลัง</th>
                                <th>ชื่อคลัง</th>
                                <th>ที่ตั้ง</th>
                                <th>รายละเอียด</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {current.length > 0 ? (
                                current.map((w) => (
                                    <tr key={w._id}>
                                        <td>{w.code}</td>
                                        <td>{w.name}</td>
                                        <td>{w.location}</td>
                                        <td>{w.description || "-"}</td>
                                        <td>
                                            <div className="warehouse-action-buttons">
                                                <button
                                                    className="warehouse-edit-btn"
                                                    onClick={() => handleOpenModal(w)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="warehouse-delete-btn"
                                                    onClick={() => handleDelete(w)}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="warehouse-no-data">
                                        ❌ ไม่พบข้อมูลคลัง
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="warehouse-pagination">
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
                <div className="warehouse-modal-overlay">
                    <div className="warehouse-modal-container">
                        <button className="warehouse-modal-close" onClick={handleCloseModal}>
                            ✖
                        </button>
                        <WarehouseForm
                            warehouse={selectedWarehouse}
                            onClose={handleCloseModal}
                            onSave={() => {
                                fetchWarehouses();
                                showPopup({
                                    type: "success",
                                    message: "✅ บันทึกคลังสำเร็จ!",
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

export default WarehouseList;
