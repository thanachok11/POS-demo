import React, { useState } from "react";
import { createCategory } from "../../api/product/categoryApi";
import "../../styles/product/CategoryModal.css";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCategory: { _id: string; name: string }) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        name: "",
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
        if (!form.name.trim()) {
            setError("กรุณากรอกชื่อหมวดหมู่");
            return;
        }

        try {
            setLoading(true);
            const res = await createCategory(form);
            // สมมุติ backend ตอบ { success: true, data: { _id, name } }
            if (res?.success && res.data) {
                onSuccess(res.data);
                onClose();
                setForm({ name: "", description: "" });
            } else {
                setError(res?.message || "ไม่สามารถเพิ่มหมวดหมู่ได้");
            }
        } catch (err: any) {
            console.error("Create category error:", err);
            setError("เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="display">
        <div className="modalcategory-overlay" onClick={onClose}>
            <div className="modalcategory" onClick={(e) => e.stopPropagation()}>
                <h2 className="modalcategory-title">เพิ่มหมวดหมู่สินค้า</h2>

                {error && <p className="modalcategory-error">{error}</p>}

                <input
                    type="text"
                    name="name"
                    placeholder="ชื่อหมวดหมู่"
                    value={form.name}
                    onChange={handleChange}
                    className="modalcategory-input"
                />

                <textarea
                    name="description"
                    placeholder="คำอธิบาย (ไม่บังคับ)"
                    value={form.description}
                    onChange={handleChange}
                    className="modalcategory-textarea"
                />

                <div className="modalcategory-actions">
                    <button onClick={onClose} className="modalcategory-button cancel">
                        ยกเลิก
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="modalcategory-button confirm">
                        {loading ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default CategoryModal;
