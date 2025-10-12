import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ เพิ่มซัพพลายเออร์ใหม่
export const addSupplier = async (supplierData: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/suppliers/create`,
            supplierData,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("❌ addSupplier Error:", error);
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการเพิ่มซัพพลายเออร์" };
    }
};

// ✅ ดึงข้อมูลซัพพลายเออร์ทั้งหมด
export const getSupplierData = async (token: string | null) => {
    try {
        if (!token) throw new Error("Unauthorized: No token provided");
        const response = await axios.get(`${API_BASE_URL}/suppliers`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    } catch (error: any) {
        console.error("❌ getSupplierData Error:", error);
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการดึงข้อมูลซัพพลายเออร์" };
    }
};

// ✅ ดึงข้อมูลซัพพลายเออร์ตาม ID
export const getSupplierById = async (id: string, token: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/suppliers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("❌ getSupplierById Error:", error);
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการดึงข้อมูลซัพพลายเออร์" };
    }
};

// ✅ อัปเดตซัพพลายเออร์ (PATCH)
export const updateSupplier = async (id: string, supplierData: any, token: string) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/suppliers/${id}`,
            supplierData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error: any) {
        console.error("❌ updateSupplier Error:", error);
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการอัปเดตซัพพลายเออร์" };
    }
};

// ✅ ลบซัพพลายเออร์
export const deleteSupplier = async (id: string, token: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/suppliers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("❌ deleteSupplier Error:", error);
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการลบซัพพลายเออร์" };
    }
};

// ✅ ดึงสินค้าพร้อม stock ตาม supplier
export const getProductsBySupplier = async (supplierId: string, token: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/suppliers/${supplierId}/products-with-stock`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error: any) {
        console.error("❌ getProductsBySupplier Error:", error);
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการดึงสินค้าจากซัพพลายเออร์" };
    }
};
