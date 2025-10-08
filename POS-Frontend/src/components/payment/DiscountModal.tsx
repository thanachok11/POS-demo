import React, { useEffect, useState } from "react";

interface DiscountModalProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
    loading: boolean;
    editData?: any | null; // ✅ ใช้ตอนแก้ไข
}

const DiscountModal: React.FC<DiscountModalProps> = ({
    onClose,
    onSubmit,
    loading,
    editData,
}) => {
    const [form, setForm] = useState({
        code: "",
        type: "percent",
        value: 0,
        description: "",
        startDate: "",
        endDate: "",
    });

    // ✅ โหลดข้อมูลเก่าเมื่อ editData เปลี่ยน
    useEffect(() => {
        if (editData) {
            setForm({
                code: editData.code || "",
                type: editData.type || "percent",
                value: editData.value || 0,
                description: editData.description || "",
                startDate: editData.startDate
                    ? new Date(editData.startDate).toISOString().split("T")[0]
                    : "",
                endDate: editData.endDate
                    ? new Date(editData.endDate).toISOString().split("T")[0]
                    : "",
            });
        }
    }, [editData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="discount-modal-overlay" onClick={onClose}>
            <div
                className="discount-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 🧭 Header */}
                <div className="discount-modal-header">
                    <h2>
                        {editData ? "✏️ แก้ไขรหัสส่วนลด" : "🎟️ เพิ่มรหัสส่วนลดใหม่"}
                    </h2>
                    <button className="discount-modal-close" onClick={onClose}>
                        ✖
                    </button>
                </div>

                {/* 🧾 Form */}
                <form onSubmit={handleSubmit} className="discount-modal-form">
                    <div className="discount-modal-group">
                        <label>รหัสส่วนลด</label>
                        <input
                            type="text"
                            placeholder="เช่น SAVE10"
                            value={form.code}
                            onChange={(e) =>
                                setForm({ ...form, code: e.target.value.toUpperCase() })
                            }
                            required
                            disabled={!!editData} // ป้องกันเปลี่ยน code ตอนแก้ไข
                        />
                    </div>

                    <div className="discount-modal-row">
                        <div className="discount-modal-group">
                            <label>ประเภทส่วนลด</label>
                            <select
                                value={form.type}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        type: e.target.value as "percent" | "baht",
                                    })
                                }
                            >
                                <option value="percent">เปอร์เซ็นต์ (%)</option>
                                <option value="baht">จำนวนเงิน (฿)</option>
                            </select>
                        </div>

                        <div className="discount-modal-group">
                            <label>มูลค่าส่วนลด</label>
                            <input
                                type="number"
                                min={1}
                                placeholder={
                                    form.type === "percent" ? "เช่น 10 (10%)" : "เช่น 100"
                                }
                                value={form.value}
                                onChange={(e) =>
                                    setForm({ ...form, value: Number(e.target.value) })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="discount-modal-group">
                        <label>คำอธิบายเพิ่มเติม</label>
                        <input
                            type="text"
                            placeholder="เช่น ส่วนลดพิเศษเดือนตุลาคม"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                    </div>

                    <div className="discount-modal-row">
                        <div className="discount-modal-group">
                            <label>วันที่เริ่มใช้</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) =>
                                    setForm({ ...form, startDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="discount-modal-group">
                            <label>วันหมดอายุ</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) =>
                                    setForm({ ...form, endDate: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="discount-modal-actions">
                        <button
                            type="submit"
                            className="discount-btn-save"
                            disabled={loading}
                        >
                            {loading
                                ? "⏳ กำลังบันทึก..."
                                : editData
                                    ? "💾 บันทึกการแก้ไข"
                                    : "✅ สร้างรหัสส่วนลด"}
                        </button>
                        <button
                            type="button"
                            className="discount-btn-cancel"
                            onClick={onClose}
                        >
                            ❌ ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DiscountModal;
