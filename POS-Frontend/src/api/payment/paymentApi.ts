import axios from "axios";

const API_URL = "http://localhost:5000/api/payment"; // เปลี่ยน URL ตาม backend ของคุณ

// ฟังก์ชันสำหรับบันทึกข้อมูลการชำระเงินและสร้างใบเสร็จ
export const createPayment = async (paymentData: {
    saleId: string;
    employeeName: string;
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    amount: number;
    items: Array<{
        barcode: string;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
}) => {
    try {
        // ส่งข้อมูลการชำระเงินและรายการสินค้าทั้งหมดไปที่ backend
        const response = await axios.post(`${API_URL}/create`, paymentData);

        if (response.data.success) {
            // เมื่อการชำระเงินและการสร้างใบเสร็จสำเร็จ ให้ส่งข้อมูลใบเสร็จกลับ
            return response.data;
        } else {
            return { success: false, message: "เกิดข้อผิดพลาดในการสร้างรายการชำระเงินและใบเสร็จ" };
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการสร้างรายการชำระเงินและใบเสร็จ:", error);
        return { success: false, message: "เกิดข้อผิดพลาดในการสร้างรายการชำระเงินและใบเสร็จ" };
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

// ดึงข้อมูลใบเสร็จ
export const getReceiptByPaymentId = async (paymentId: string) => {
    try {
        const response = await axios.get(`${API_URL}/receipt/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ:", error);
        return { success: false, message: "ไม่พบข้อมูลใบเสร็จ" };
    }
};
