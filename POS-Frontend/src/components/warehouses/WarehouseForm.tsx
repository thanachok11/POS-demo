import { useState } from "react";
import { saveWarehouse } from "../../api/warehouse/warehouseApi";
import "../../styles/warehouse/WarehouseList.css";

interface Warehouse {
    _id?: string;
    name: string;
    code?: string; // ✅ optional เพราะ backend จะ gen เอง
    location: string;
    description?: string;
}

interface Props {
    warehouse?: Warehouse | null;
    onClose: () => void;
    onSave: () => void;
}

const WarehouseForm = ({ warehouse, onClose, onSave }: Props) => {
    const [form, setForm] = useState<Warehouse>(
        warehouse || { name: "", code: "", location: "", description: "" }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // ❌ ป้องกันการแก้ไข code
        if (name === "code") return;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");

        if (!form.name || !form.location) {
            alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        try {
            // ❌ ไม่ส่ง code ไป (ให้ backend gen เอง)
            const { code, ...payload } = form;
            await saveWarehouse(payload, token!);
            onSave();
        } catch (error) {
            console.error("❌ saveWarehouse Error:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };

    return (
        <div className="warehouse-form">
            <h3 className="warehouse-form-header">
                {warehouse ? "✏️ แก้ไขคลังสินค้า" : "➕ เพิ่มคลังสินค้าใหม่"}
            </h3>

            <div className="warehouse-form-group">
                <label>ชื่อคลังสินค้า</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="ชื่อคลังสินค้า"
                    required
                />
            </div>

            {/* ✅ แสดงรหัสคลังเฉพาะตอนแก้ไข */}
            {form.code && (
                <div className="warehouse-form-group">
                    <label>รหัสคลัง (Code)</label>
                    <input
                        type="text"
                        name="code"
                        value={form.code}
                        readOnly
                        disabled
                        className="warehouse-code-input"
                    />
                </div>
            )}

            <div className="warehouse-form-group">
                <label>ที่ตั้ง (Location)</label>
                <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="เช่น โกดังหลัก"
                    required
                />
            </div>

            <div className="warehouse-form-group">
                <label>คำอธิบาย</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="รายละเอียดเพิ่มเติม..."
                />
            </div>

            <div className="warehouse-form-actions">
                <button className="warehouse-save-btn" onClick={handleSubmit}>
                    บันทึก
                </button>
                <button className="warehouse-cancel-btn" onClick={onClose}>
                    ยกเลิก
                </button>
            </div>
        </div>
    );
};

export default WarehouseForm;
