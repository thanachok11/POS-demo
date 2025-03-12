import axios from "axios";

const API_URL = "http://localhost:5000/api/payment"; // เปลี่ยน URL ตาม backend ของคุณ

// ฟังก์ชันสำหรับบันทึกข้อมูลการชำระเงิน
export const createPayment = async (paymentData: {
    orderId: string;
    customerName: string;
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    amount: number;
}) => {
    try {
        const response = await axios.post(`${API_URL}/create`, paymentData);
        return response.data;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน:", error);
        return { success: false, message: "เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน" };
    }
};

// ดึงข้อมูลการชำระเงินของออเดอร์
export const getPaymentByOrderId = async (orderId: string) => {
    try {
        const response = await axios.get(`${API_URL}/order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน:", error);
        return { success: false, message: "ไม่พบข้อมูลการชำระเงิน" };
    }
};
