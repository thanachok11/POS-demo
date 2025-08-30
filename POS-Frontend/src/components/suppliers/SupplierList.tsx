import { useEffect, useState } from "react";
import { getSupplierData, deleteSupplier } from "../../api/suppliers/supplierApi.ts";
import "../../styles/supplier/SupplierList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faSearch, faEnvelope, faBriefcase, faPlus } from "@fortawesome/free-solid-svg-icons";
import SupplierForm from "./SupplierForm.tsx";
import React from "react";

interface Supplier {
    id: number;
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
            console.log("📌 API Response:", response);

            if (Array.isArray(response)) {
                setSuppliers(response); // กำหนดค่า suppliers ตรงๆ
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


    const handleDelete = async (id: number) => {
        if (!window.confirm("คุณต้องการลบซัพพลายเออร์นี้ใช่หรือไม่?")) return;
        const token = localStorage.getItem("token");
        try {
            await deleteSupplier(id, token);
            setSuppliers((prev) => prev.filter(supplier => supplier.id !== id));
        } catch (err) {
            console.error("Error deleting supplier:", err);
            setError("เกิดข้อผิดพลาดในการลบซัพพลายเออร์");
        }
    };

    const handleOpenModal = (supplier?: Supplier) => {
        setSelectedSupplier(supplier || null);
        setModalOpen(true);
    };
    const handleSave = () => {
        console.log("Supplier saved!");
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        fetchSuppliers(); // โหลดข้อมูลใหม่เมื่อปิดโมดอล
    };

    return (
        <div className="display">
        <div className="supplier-list-container">
            {loading && <p className="supplier-list-loading">⏳ กำลังโหลด...</p>}
            <h2 className="supplier-list-title">📋รายชื่อซัพพลายเออร์</h2>
            <button className="add-supplier-btn" onClick={() => handleOpenModal()}>
                <FontAwesomeIcon icon={faPlus} /> เพิ่มซัพพลายเออร์
            </button>
            {error && <p className="supplier-list-error">{error}</p>}

            <table className="supplier-table">
                <thead className="supplier-table-head">
                    <tr className="supplier-table-row">
                        <th className="supplier-table-header">ชื่อ</th>
                        <th className="supplier-table-header">เบอร์โทร</th>
                        <th className="supplier-table-header">อีเมล</th>
                        <th className="supplier-table-header">ที่อยู่</th>
                        <th className="supplier-table-header">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="supplier-table-body">
                    {suppliers.length > 0 ? (
                        suppliers.map((supplier, index) => (
                            <tr key={supplier.id || `supplier-${index}`} className="supplier-table-row">
                                <td className="supplier-table-data">{supplier.companyName}</td>
                                <td className="supplier-table-data">{supplier.phoneNumber}</td>
                                <td className="supplier-table-data">{supplier.email}</td>
                                <td className="supplier-table-data">
                                    {supplier.address}, {supplier.subDistrict}, {supplier.district}, {supplier.stateOrProvince}, {supplier.country} {supplier.postalCode}
                                </td>
                                <td className="supplier-table-data">
                                    <div className="action-buttons">
                                        <button className="edit-btn" onClick={() => handleOpenModal(supplier)}>แก้ไข</button>
                                        <button className="delete-btn" onClick={() => handleDelete(supplier.id)}>ลบ</button>
                                    </div>
                                </td>

                            </tr>
                        ))
                    ) : (
                        <tr className="supplier-table-row">
                            <td colSpan={5} className="supplier-table-no-data">❌ ไม่พบซัพพลายเออร์</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <button className="modal-close" onClick={handleCloseModal}>❌</button>
                        <SupplierForm
                            supplier={selectedSupplier}
                            onClose={handleCloseModal}
                            onSave={handleSave}
                        />
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default SupplierList;
