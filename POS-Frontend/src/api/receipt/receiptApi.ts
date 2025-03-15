import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// 📌 ดึงรายการใบเสร็จทั้งหมด
export const fetchReceipts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/receipts`);
    return response.data.success ? response.data.receipts : [];
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }
};

// 📌 ดึงข้อมูลใบเสร็จตาม `saleId`
export const fetchReceiptBySaleId = async (saleId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/receipts/${saleId}`);
    return response.data.success ? response.data.receipt : null;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return null;
  }
};

// 📌 ลบใบเสร็จตาม `saleId`
export const deleteReceipt = async (saleId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/receipts/${saleId}`);
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return false;
  }
};
