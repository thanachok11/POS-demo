import axios from "axios";

// Base URL ของ API
const API_BASE_URL = process.env.REACT_APP_API_URL;

// ฟังก์ชันสร้างคำสั่งซื้อใหม่
export const createOrder = async (orderData: {
    items: { productId: string; quantity: number }[];
    location: string;
    supplierCompany: string;
    supplierId: string;
}, token: string) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };
        const response = await axios.post(`${API_BASE_URL}/orders/create`, orderData, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// ฟังก์ชันดึงข้อมูลคำสั่งซื้อทั้งหมดของผู้ใช้
export const getOrders = async (token: string) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.get(`${API_BASE_URL}/orders`, config);
        return response.data.orders;
    } catch (error) {
        throw error;
    }
};
// ฟังก์ชันอัปเดตสถานะคำสั่งซื้อ (PUT)
export const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    token: string
) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };

        const response = await axios.put(
            `${API_BASE_URL}/orders/${orderId}/status`,
            { status: newStatus },
            config
        );

        return response.data; // ส่งข้อมูลผลลัพธ์กลับไป เช่น { success: true, message, order }
    } catch (error: any) {
        // คุณอาจจะทำ error handling เพิ่มเติมตรงนี้ได้ เช่น
        if (error.response) {
            // Error ตอบกลับจากเซิร์ฟเวอร์
            throw new Error(error.response.data.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
        } else if (error.request) {
            // ไม่มีการตอบกลับจากเซิร์ฟเวอร์
            throw new Error("ไม่มีการตอบกลับจากเซิร์ฟเวอร์");
        } else {
            // ข้อผิดพลาดอื่น ๆ
            throw new Error(error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
        }
    }
};