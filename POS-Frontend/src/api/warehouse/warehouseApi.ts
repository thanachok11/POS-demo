import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface WarehousePayload {
    _id?: string;
    name: string;
    code: string;
    location: string;
    description?: string;
}


/* 📦 ดึงข้อมูลคลัง */
export const getWarehouseData = async (token: string) => {
    const res = await axios.get(`${API_BASE}/warehouses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data || res.data;
};

/* 🏗️ เพิ่ม / แก้ไข คลังสินค้า */
export const saveWarehouse = async (data: any, token: string) => {
    try {
        const url = data._id
            ? `${API_BASE}/warehouses/${data._id}`
            : `${API_BASE}/warehouses/create`;     

        const method = data._id ? "patch" : "post";

        const res = await axios({
            method,
            url,
            data,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data;
    } catch (error: any) {
        console.error("❌ saveWarehouse error:", error);
        if (error.response?.status === 400 && error.response.data?.error === "ห้ามแก้ไขรหัสคลัง (code)") {
            throw new Error("⚠️ ไม่สามารถแก้ไขรหัสคลังได้");
        } else if (error.response?.data?.error) {
            throw new Error(`❌ ${error.response.data.error}`);
        } else {
            throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูลคลัง");
        }
    }
};

/* ❌ ลบคลัง */
export const deleteWarehouse = async (id: string, token: string) => {
    try {
        const res = await axios.delete(`${API_BASE}/warehouses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        throw error.response?.data || { error: "เกิดข้อผิดพลาดในการลบคลัง" };
    }
};
