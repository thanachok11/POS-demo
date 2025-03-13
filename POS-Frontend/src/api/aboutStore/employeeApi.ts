import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/employee";

export const getEmployeesByManager = async (token: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return response.data; // Axios คืนค่า response.data โดยตรง
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch employees");
    }
};
