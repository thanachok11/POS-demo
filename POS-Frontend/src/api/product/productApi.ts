import axios from "axios";

// Base URL ของ API
const API_BASE_URL = "http://localhost:5000/api";

// ฟังก์ชันเพื่อดึงรายการสินค้าทั้งหมด
export const getProducts = async () => {
  const token = localStorage.getItem('token'); // ดึง token จาก localStorage

  if (!token) {
    throw new Error('No token found');
  }

  try {
    // ส่ง token ไปใน Authorization header
    const response = await axios.get(`${API_BASE_URL}/products/get`, {
      headers: {
        'Authorization': `Bearer ${token}` // ใส่ token ใน header
      }
    });

    return response.data; // ส่งข้อมูลที่ได้จาก API กลับมา
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // ส่งข้อผิดพลาดออกไปหากเกิดการผิดพลาด
  }
};

// ฟังก์ชันเพื่อดึงสินค้าโดยใช้ barcode
export const getProductByBarcode = async (barcode: string) => {
  console.log("Fetching product with barcode:", barcode); // Log the barcode
  try {
    const response = await axios.get(`${API_BASE_URL}/products/barcode/${barcode}`);
    console.log("API response:", response.data); // Log the full response data
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
export const createOrder = async (Orderdata: any, token: string) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`${API_BASE_URL}/orders/create`, Orderdata, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const placeOrder = async (orderData: any) => {
  return await axios.post(`${API_BASE_URL}/checkout`, orderData);
};