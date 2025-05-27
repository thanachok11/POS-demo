import axios from "axios";

const BASE_URL = "http://localhost:5000/api"; // เปลี่ยนตาม backend จริง

export const getCategories = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/category`, {
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
