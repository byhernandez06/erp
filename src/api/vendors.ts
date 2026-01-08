// src/api/vendors.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener proveedores con paginación y búsqueda
export const getVendors = async (page: number, limit: number, search: string) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.get(`${API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, search },
    });

    return data; // { data: [], totalPages: X }
};


export const getAllVendors = async () => {
    const token = localStorage.getItem("token");

    const { data } = await axios.get(`${API_URL}/vendors/all`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return data;
};

// Crear proveedor
export const createVendor = async (vendor: any) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.post(`${API_URL}/vendors`, vendor, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return data;
};

// Actualizar proveedor
export const updateVendor = async (id: number, vendor: any) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.put(`${API_URL}/vendors/${id}`, vendor, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return data;
};

// Obtener proveedor individual (opcional)
export const getVendorById = async (id: number) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.get(`${API_URL}/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return data;
};
