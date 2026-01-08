// /src/api/catapresu.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// export const searchBudgetAccounts = async (q: string) => {
//     const { data } = await axios.get(`${API_URL}/catapresu/search`, {
//         headers: authHeader(),
//         params: { q },
//     });
//     return data; // [{ CUENTA, DESCRI1, DISPONIBLE, COMPROMETI, RECIBE }]
// };

export const getBudgetAccount = async (cuenta: string) => {
    const { data } = await axios.get(`${API_URL}/catapresu/${cuenta}`, {
        headers: authHeader(),
    });
    return data;
};

export const commitBudget = async (cuenta: string, monto: number) => {
    const { data } = await axios.post(
        `${API_URL}/catapresu/commit`,
        { cuenta, monto },
        { headers: authHeader() }
    );
    return data;
};

export const getAllBudgetAccounts = async () => {
    const { data } = await axios.get(`${API_URL}/catapresu/all`, {
        headers: authHeader(),
    });
    return data;
};

export const getAllBudgetAccountsRaw = async () => {
    const { data } = await axios.get(`${API_URL}/catapresu/all-raw`, {
        headers: authHeader(),
    });
    return data;
};
