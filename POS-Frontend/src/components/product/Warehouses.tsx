import React, { useState } from "react";
import { createWarehouse } from "../../api/product/warehousesApi.ts";
import "../../styles/product/WarehouseModal.css";

interface WarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newWarehouse: any) => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        name: "",
        location: "",
        description: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.name || !form.location) {
            setError("กรุณากรอกชื่อและตำแหน่งจัดเก็บ");
            return;
        }

        try {
            setLoading(true);
            const data = await createWarehouse(form);
            if (onSuccess) onSuccess(data);
            onClose();
            setForm({ name: "", location: "", description: "" }); // เคลียร์ form
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเพิ่มคลังสินค้า");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modalwarehouse-overlay" onClick={onClose}>
            <div className="modalwarehouse" onClick={(e) => e.stopPropagation()}>
                <h2 className="modalwarehouse-title">เพิ่มคลังสินค้า</h2>

                {error && <p className="modalwarehouse-error">{error}</p>}

                <input
                    type="text"
                    name="name"
                    placeholder="ชื่อคลังสินค้า"
                    value={form.name}
                    onChange={handleChange}
                    className="modalwarehouse-input"
                />
                <input
                    type="text"
                    name="location"
                    placeholder="ตำแหน่งจัดเก็บ"
                    value={form.location}
                    onChange={handleChange}
                    className="modalwarehouse-input"
                />
                <textarea
                    name="description"
                    placeholder="คำอธิบาย (ไม่บังคับ)"
                    value={form.description}
                    onChange={handleChange}
                    className="modalwarehouse-textarea"
                />

                <div className="modalwarehouse-actions">
                    <button onClick={onClose} className="modalwarehouse-button cancel">
                        ยกเลิก
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="modalwarehouse-button confirm">
                        {loading ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseModal;
