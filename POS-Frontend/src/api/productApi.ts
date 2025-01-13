import axios from "axios";

// Base URL ของ API
const API_BASE_URL = "http://10.30.136.5:5000/api";

// ฟังก์ชันเพื่อดึงรายการสินค้าทั้งหมด
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// ฟังก์ชันเพื่อดึงสินค้าโดยใช้ barcode
export const getProductByBarcode = async (barcode: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product/barcode/${barcode}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    throw error;
  }
};

// ฟังก์ชันสำหรับอัปโหลดสินค้าใหม่ (จากตัวอย่างก่อนหน้า)
export const uploadProduct = async (data: FormData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/product/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading product:", error);
    throw error;
  }
};
