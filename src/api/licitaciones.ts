import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllLicitaciones = async () => {
    const token = localStorage.getItem("token");

    const { data } = await axios.get(`${API_URL}/licitaciones`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return data; // { data: [] }
};
