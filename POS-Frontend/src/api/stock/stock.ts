import axios from "axios";

// Base URL ของ API
const API_BASE_URL = "http://localhost:5000/api/stock";

export const fetchStockData = async () => {
  try {
    // ใช้ axios ดึงข้อมูลสินค้าจาก API
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data; // คืนค่าข้อมูลที่ได้จาก API
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึง Stock:", error);
    throw new Error("Error fetching stock data");
  }
};

export const getStockByBarcode = async (barcode: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/barcode/${barcode}`);

    // เช็คสถานะการตอบกลับจาก API ถ้าสำเร็จ
    if (response.status === 200) {
      return response.data.stockQuantity; // คืนค่าจำนวนสินค้าที่มีในสต็อก
    } else {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสต็อก");
      return ; // คืนค่า 0 ถ้าผลลัพธ์ไม่สำเร็จ
    }
  } catch (error) {
    console.error('Error fetching stock by barcode:', error);
    throw new Error('ไม่สามารถค้นหาสินค้าได้'); // แสดงข้อผิดพลาดเมื่อไม่สามารถดึงข้อมูลได้
  }
};

// 📌 ดึง Stock ตาม Product ID
export const getStockByProductId = async (productId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?productId=${productId}`);
    return response.data;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึง Stock ของสินค้า:", error);
    throw error;
  }
};
export const updateStockByBarcode = async (barcode: string, quantity: number) => {
  try {
    // ทำการส่งค่า barcode และ quantity ไปยัง API เพื่ออัปเดตสต็อก
    const response = await axios.put(
      `${API_BASE_URL}/barcode/${barcode}`,  // URL ที่เชื่อมต่อกับ backend ของคุณ
      {
        quantity: quantity,  // จำนวนสินค้าที่ซื้อไป (จะทำการลดจำนวนสินค้าจากสต็อก)
      }
    );
    return response.data;  // ส่งข้อมูลจาก backend กลับไป
  } catch (error) {
    console.error("Error updating stock:", error);
    throw new Error("ไม่สามารถอัปเดตสต็อกได้");
  }
};


// 📌 เพิ่มสินค้าเข้า Stock
export const addStock = async (data: {
  productId: string;
  quantity: number;
  supplier?: string;
  location?: string;
  threshold?: number;
}) => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่ม Stock:", error);
    throw error;
  }
};

// 📌 อัปเดต Stock (ใช้ตอน checkout)
export const updateStock = async (stockId: string, newQuantity: number) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${stockId}`, {
      quantity: newQuantity,
    });
    return response.data;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดต Stock:", error);
    throw error;
  }
};

// 📌 ลบ Stock (ถ้าต้องการ)
export const deleteStock = async (stockId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${stockId}`);
    return response.data;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบ Stock:", error);
    throw error;
  }
};
