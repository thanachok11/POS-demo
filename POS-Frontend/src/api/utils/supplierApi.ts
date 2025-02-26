import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // URL ของ backend API

// เพิ่มซัพพลายเออร์ใหม่
export const addSupplier = async (supplierData: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/suppliers/add-suppliers`,  // Assuming you have an endpoint like /suppliers
            supplierData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;  // Assuming the response returns data
    } catch (error) {
        console.error("Error in addSupplier:", error);
        throw new Error("Failed to add supplier");
    }
};

// ดึงข้อมูลซัพพลายเออร์
export const getSupplierData = async (token: string | null) => {
    try {
        if (!token) throw new Error("Unauthorized: No token provided");

        const response = await axios.get(`${API_BASE_URL}/suppliers`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data.data; // คืนค่าเฉพาะข้อมูลซัพพลายเออร์
    } catch (error: any) {
        console.error("Error fetching supplier data:", error);
        throw new Error(error.response?.data?.message || "Error fetching supplier data");
    }
};

// ลบซัพพลายเออร์
export const deleteSupplier = async (id: number, token: string | null) => {
    try {
        if (!token) throw new Error("Unauthorized: No token provided");

        const response = await axios.delete(`${API_BASE_URL}/suppliers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error deleting supplier");
    }
};
