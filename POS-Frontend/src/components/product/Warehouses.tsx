import React, { useState } from "react";
import { saveWarehouse } from "../../api/warehouse/warehouseApi";
import "../../styles/product/WarehouseModal.css";

interface WarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newWarehouse: any) => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [form, setForm] = useState({
        name: "",
        location: "",
        description: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.name.trim() || !form.location.trim()) {
            setError("⚠️ กรุณากรอกชื่อคลังและตำแหน่งจัดเก็บให้ครบถ้วน");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ ไม่มี token กรุณาเข้าสู่ระบบใหม่");
            return;
        }

        try {
            setLoading(true);
            const response = await saveWarehouse(form, token);

            // ✅ ถ้า backend ส่งกลับ warehouse ที่สร้างใหม่
            if (response?.success && response.data) {
                onSuccess(response.data);
                setForm({ name: "", location: "", description: "" }); // เคลียร์ form
                onClose();
            } else if (response?._id) {
                // fallback: ถ้า backend คืน object โดยตรง
                onSuccess(response);
                onClose();
            } else {
                setError(response?.message || "ไม่สามารถเพิ่มคลังสินค้าได้");
            }
        } catch (err: any) {
            console.error("❌ createWarehouse Error:", err);
            setError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มคลังสินค้า");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modalwarehouse-overlay" onClick={onClose}>
            <div
                className={`modalwarehouse-content ${loading ? "loading" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="modalwarehouse-title">เพิ่มคลังสินค้าใหม่</h2>

                {error && <p className="modalwarehouse-error">{error}</p>}

                <input
                    type="text"
                    name="name"
                    placeholder="ชื่อคลังสินค้า (เช่น คลังหลัก)"
                    value={form.name}
                    onChange={handleChange}
                    className="modalwarehouse-input"
                />

                <input
                    type="text"
                    name="location"
                    placeholder="ตำแหน่งจัดเก็บ (เช่น โกดัง A, ชั้น 2)"
                    value={form.location}
                    onChange={handleChange}
                    className="modalwarehouse-input"
                />

                <textarea
                    name="description"
                    placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                    value={form.description}
                    onChange={handleChange}
                    className="modalwarehouse-textarea"
                    rows={3}
                />

                <div className="modalwarehouse-actions">
                    <button
                        onClick={onClose}
                        className="modalwarehouse-button cancel"
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="modalwarehouse-button confirm"
                    >
                        {loading ? "⏳ กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseModal;
