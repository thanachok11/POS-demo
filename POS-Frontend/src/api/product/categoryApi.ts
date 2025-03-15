import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// ฟังก์ชันดึงหมวดหมู่สินค้า
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, data: [], message: "ไม่สามารถดึงข้อมูลหมวดหมู่ได้" };
  }
};
