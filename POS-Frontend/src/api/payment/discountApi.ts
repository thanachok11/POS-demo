import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/discounts`;

export const getDiscounts = async (token: string) => {
    const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const createDiscount = async (data: any, token: string) => {
    const res = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const updateDiscount = async (id: string, data: any, token: string) => {
    const res = await axios.patch(`${API_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};


export const deleteDiscount = async (id: string, token: string) => {
    const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const validateDiscount = async (code: string, token: string) => {
    const res = await axios.post(
        `${API_URL}/validate`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};
