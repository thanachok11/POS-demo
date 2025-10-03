import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ดึงรายการใบเสร็จทั้งหมด
export const fetchReceipts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/receipts`);
    return response.data.success ? response.data.receipts : [];
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }
};

// ดึงข้อมูลใบเสร็จตาม `saleId`
export async function fetchReceiptById(paymentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts/paymentId/${paymentId}`);
    if (!response.ok) {
      throw new Error("ไม่สามารถดึงข้อมูลใบเสร็จได้");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
  }
}

// ลบใบเสร็จตาม `saleId`
export const deleteReceipt = async (saleId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/receipts/${saleId}`);
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return false;
  }
};

// 📌 ดึง Sales Summary (วันนี้ / สัปดาห์นี้ / เดือนนี้)
export const fetchSalesSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/receipts/sales-summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    return { success: false };
  }
};