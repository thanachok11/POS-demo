import axios from "axios";

const BASE_URL = "http://localhost:5000/api"; // เปลี่ยนตาม backend จริง

export const getCategories = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/products/categories/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProductsByCategory = async (token: string, category: string) => {
  const response = await axios.get(`${BASE_URL}/products/category/${category}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export interface CategoryData {
  name: string;
  description?: string;
}

export const createCategory = async (data: CategoryData): Promise<any> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const response = await axios.post(`${BASE_URL}/products/category/create`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to create category");
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("No response from server");
    } else {
      console.error("Error setting up request:", error.message);
      throw new Error(error.message);
    }
  }
};