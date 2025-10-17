import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./config";

export interface OrdenDeCompraData {
    licitacion: string;
    fecha: string;
    numeroOrden: string;
    proveedor: string;
    descripcion: string;
    proyecto: string;
    lugarEntrega: string;
    solicitante: string;
    cedulaJuridica: string;
    items: {
        cantidad: number;
        unidad: string;
        detalle: string;
        cuenta: string;
        nombre: string;
        costoUnitario: number;
        montoTotal: number;
    }[];
    estado?: string;
    fechaCreacion?: Timestamp;
}

export const crearOrdenDeCompra = async (order: OrdenDeCompraData) => {
    try {
        const estados = ["Pendiente", "En proceso", "Completado"];
        const docRef = await addDoc(collection(db, "buy-orders"), {
            ...order,
            estado: order.estado || estados[Math.floor(Math.random() * estados.length)],
            fechaCreacion: Timestamp.now(),
        });
        console.log("Orden guardada con ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error guardando la orden:", error);
        throw error;
    }
};

export const obtenerOrdenesDeCompra = async () => {
    const snapshot = await getDocs(collection(db, "buy-orders"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
