import { ordenesAPI } from './apiService';

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
}

export interface OrdenDeCompraResponse extends OrdenDeCompraData {
    id: number;
    uid: string;
    fechaCreacion: Date | string;
    fechaActualizacion: Date | string;
}

// Función para crear una nueva orden de compra
export const crearOrdenDeCompra = async (orderData: OrdenDeCompraData): Promise<number> => {
    try {
        const response = await ordenesAPI.create(orderData);
        return response.id || response.orden?.id;
    } catch (error: any) {
        console.error('Error creando orden:', error);
        throw new Error(error.message || 'Error al crear la orden de compra');
    }
};

// Función para obtener todas las órdenes de compra
export const obtenerOrdenesDeCompra = async (): Promise<OrdenDeCompraResponse[]> => {
    try {
        const response = await ordenesAPI.getAll();
        
        // Normalizar la respuesta del backend
        const ordenes = response.ordenes || response.data || response;
        
        return ordenes.map((orden: any) => ({
            id: orden.id,
            uid: orden.uid || orden.user_id,
            licitacion: orden.licitacion,
            fecha: orden.fecha,
            numeroOrden: orden.numero_orden || orden.numeroOrden,
            proveedor: orden.proveedor,
            descripcion: orden.descripcion,
            proyecto: orden.proyecto,
            lugarEntrega: orden.lugar_entrega || orden.lugarEntrega,
            solicitante: orden.solicitante,
            cedulaJuridica: orden.cedula_juridica || orden.cedulaJuridica,
            estado: orden.estado,
            fechaCreacion: orden.created_at || orden.fechaCreacion,
            fechaActualizacion: orden.updated_at || orden.fechaActualizacion,
            items: orden.items || []
        }));
    } catch (error: any) {
        console.error('Error obteniendo órdenes:', error);
        throw new Error(error.message || 'Error al obtener las órdenes de compra');
    }
};

// Función para obtener una orden específica por ID
export const obtenerOrdenPorId = async (id: number): Promise<OrdenDeCompraResponse | null> => {
    try {
        const response = await ordenesAPI.getById(id);
        const orden = response.orden || response.data || response;
        
        if (!orden) {
            return null;
        }

        return {
            id: orden.id,
            uid: orden.uid || orden.user_id,
            licitacion: orden.licitacion,
            fecha: orden.fecha,
            numeroOrden: orden.numero_orden || orden.numeroOrden,
            proveedor: orden.proveedor,
            descripcion: orden.descripcion,
            proyecto: orden.proyecto,
            lugarEntrega: orden.lugar_entrega || orden.lugarEntrega,
            solicitante: orden.solicitante,
            cedulaJuridica: orden.cedula_juridica || orden.cedulaJuridica,
            estado: orden.estado,
            fechaCreacion: orden.created_at || orden.fechaCreacion,
            fechaActualizacion: orden.updated_at || orden.fechaActualizacion,
            items: orden.items || []
        };
    } catch (error: any) {
        console.error('Error obteniendo orden por ID:', error);
        throw new Error(error.message || 'Error al obtener la orden de compra');
    }
};

// Función para actualizar el estado de una orden
export const actualizarEstadoOrden = async (id: number, estado: string): Promise<boolean> => {
    try {
        await ordenesAPI.updateStatus(id, estado);
        return true;
    } catch (error: any) {
        console.error('Error actualizando estado:', error);
        throw new Error(error.message || 'Error al actualizar el estado de la orden');
    }
};

// Función para actualizar una orden completa
export const actualizarOrden = async (id: number, orderData: Partial<OrdenDeCompraData>): Promise<boolean> => {
    try {
        await ordenesAPI.update(id, orderData);
        return true;
    } catch (error: any) {
        console.error('Error actualizando orden:', error);
        throw new Error(error.message || 'Error al actualizar la orden de compra');
    }
};

// Función para eliminar una orden
export const eliminarOrden = async (id: number): Promise<boolean> => {
    try {
        await ordenesAPI.delete(id);
        return true;
    } catch (error: any) {
        console.error('Error eliminando orden:', error);
        throw new Error(error.message || 'Error al eliminar la orden de compra');
    }
};