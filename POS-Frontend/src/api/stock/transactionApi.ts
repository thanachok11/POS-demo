import axios from "axios";

// Base URL ของ API
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const getStockTransactions = async (token: string) => {
    const res = await axios.get(`${API_BASE_URL}/stock/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getTransactionsByProduct = async (productId: string, token: string) => {
    const res = await axios.get(`${API_BASE_URL}/stock/transactions/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getTransactionsByStock = async (stockId: string, token: string) => {
    const res = await axios.get(`${API_BASE_URL}/stock/transactions/stock/${stockId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};


