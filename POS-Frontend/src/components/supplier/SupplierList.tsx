import { useEffect, useState } from "react";
import { getSupplierData, deleteSupplier } from "../../api/utils/supplierApi.ts";
import "../../styles/supplier/SupplierList.css";
import SupplierForm from "../../components/supplier/SupplierForm.tsx";
import React from "react";

interface Supplier {
    id: number;
    companyName: string;
    phoneNumber: string;
    email: string;
    address: string;
    country: string;
    stateOrProvince: string;
    district?: string;
    subDistrict: string;
    postalCode?: string;
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
            await deleteSupplier(id,token);
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
        <div className="supplier-list-container">
            {loading && <p className="loading">⏳ Loading...</p>}
            <h2 className="supplier-list-title">รายชื่อซัพพลายเออร์</h2>
            <button className="add-supplier-btn" onClick={() => handleOpenModal()}>
                ➕ เพิ่มซัพพลายเออร์
            </button>
            {error && <p className="error-message">{error}</p>}

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
                    {suppliers.length > 0 ? (
                        suppliers.map((supplier, index) => (
                            <tr key={supplier.id || `supplier-${index}`}>
                                <td>{supplier.companyName}</td>
                                <td>{supplier.phoneNumber}</td>
                                <td>{supplier.email}</td>
                                <td>
                                    {supplier.address}, {supplier.subDistrict}, {supplier.district}, {supplier.stateOrProvince}, {supplier.country} {supplier.postalCode}
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleOpenModal(supplier)}>แก้ไข</button>
                                    <button className="delete-btn" onClick={() => handleDelete(supplier.id)}>ลบ</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center" }}>❌ ไม่พบซัพพลายเออร์</td>
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
    );
};

export default SupplierList;
