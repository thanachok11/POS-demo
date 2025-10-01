import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

interface WarehouseData {
    name: string;
    location?: string;
    description?: string;
}

// GET all warehouses
export const getWarehouses = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.get(`${API_BASE_URL}/warehouses`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        throw error;
    }
};


// CREATE warehouse
export const createWarehouse = async (
    data: WarehouseData
): Promise<any> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.post(`${API_BASE_URL}/warehouses/create`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Error response:", error.response.data);
            throw new Error(error.response.data.message || "Failed to create warehouse");
        } else if (error.request) {
            console.error("No response received:", error.request);
            throw new Error("No response from server");
        } else {
            console.error("Error setting up request:", error.message);
            throw new Error(error.message);
        }
    }
};

// UPDATE warehouse
export const updateWarehouse = async (
    warehouseId: string,
    data: { name?: string; location?: string; description?: string }
) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.put(`${API_BASE_URL}/warehouses/${warehouseId}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating warehouse:", error);
        throw error;
    }
};

// DELETE warehouse
export const deleteWarehouse = async (warehouseId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.delete(`${API_BASE_URL}/warehouses/${warehouseId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting warehouse:", error);
        throw error;
    }
};
