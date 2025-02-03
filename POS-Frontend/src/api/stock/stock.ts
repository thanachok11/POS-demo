import axios from "axios";

// Base URL ของ API
const API_BASE_URL = "http://localhost:5000/api";

export const fetchStockData = async () => {
  try {
    // ใช้ axios ดึงข้อมูลสินค้าจาก API
    const response = await axios.get(`${API_BASE_URL}/stock`);
    return response.data; // คืนค่าข้อมูลที่ได้จาก API
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw new Error("Error fetching stock data");
  }
};
