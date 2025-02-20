import axios from "axios";

// Base URL ของ API
const API_BASE_URL = "http://localhost:5000/api";

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
    const response = await axios.get(`${API_BASE_URL}/products/barcode/${barcode}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    throw error;
  }
};

// ฟังก์ชันสำหรับอัปโหลดสินค้าใหม่ (จากตัวอย่างก่อนหน้า)
export const uploadProduct = async (formData: FormData, token: string | null) => {
  try {
    const response = await axios.post((`${API_BASE_URL}/product/upload`),formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Include token in the Authorization header
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
export const createOrder = async (orderData: any) => {
  const token = localStorage.getItem("token"); // ดึง token ผู้ใช้
  const response = await axios.post(`${API_BASE_URL}/order`, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const placeOrder = async (orderData: any) => {
  return await axios.post(`${API_BASE_URL}/checkout`, orderData);
};