import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const createOrder = async (data: any) => {
    const token = localStorage.getItem("token");

    return axios.post(`${API_URL}/orders`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};


export const getNextOrderNumber = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/orders/next`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.next;
};


export const getAllOrders = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
};

export const searchOrders = async (term: string) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/orders/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { term },
    });
    return response.data;
};