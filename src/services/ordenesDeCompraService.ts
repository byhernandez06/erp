import { pool } from '../config/database';

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
    fechaCreacion: Date;
    fechaActualizacion: Date;
}

// Función para crear una nueva orden de compra
export const crearOrdenDeCompra = async (
    uid: string, 
    orderData: OrdenDeCompraData
): Promise<number> => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Insertar la orden principal
        const [orderResult] = await connection.execute(`
            INSERT INTO buy_orders (
                uid, licitacion, fecha, numero_orden, proveedor, descripcion,
                proyecto, lugar_entrega, solicitante, cedula_juridica, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            uid,
            orderData.licitacion,
            orderData.fecha,
            orderData.numeroOrden,
            orderData.proveedor,
            orderData.descripcion,
            orderData.proyecto,
            orderData.lugarEntrega,
            orderData.solicitante,
            orderData.cedulaJuridica,
            orderData.estado || 'Pendiente'
        ]);

        const orderId = (orderResult as any).insertId;

        // Insertar los items de la orden
        if (orderData.items && orderData.items.length > 0) {
            const itemsValues = orderData.items.map(item => [
                orderId,
                item.cantidad,
                item.unidad,
                item.detalle,
                item.cuenta,
                item.nombre,
                item.costoUnitario,
                item.montoTotal
            ]);

            const placeholders = orderData.items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const flatValues = itemsValues.flat();

            await connection.execute(`
                INSERT INTO buy_order_items (
                    order_id, cantidad, unidad, detalle, cuenta, nombre,
                    costo_unitario, monto_total
                ) VALUES ${placeholders}
            `, flatValues);
        }

        await connection.commit();
        console.log('Orden guardada con ID:', orderId);
        return orderId;

    } catch (error) {
        await connection.rollback();
        console.error('Error guardando la orden:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Función para obtener todas las órdenes de compra de un usuario
export const obtenerOrdenesDeCompra = async (uid?: string): Promise<OrdenDeCompraResponse[]> => {
    try {
        let query = `
            SELECT 
                o.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', i.id,
                        'cantidad', i.cantidad,
                        'unidad', i.unidad,
                        'detalle', i.detalle,
                        'cuenta', i.cuenta,
                        'nombre', i.nombre,
                        'costoUnitario', i.costo_unitario,
                        'montoTotal', i.monto_total
                    )
                ) as items_json
            FROM buy_orders o
            LEFT JOIN buy_order_items i ON o.id = i.order_id
        `;

        const params: any[] = [];
        
        if (uid) {
            query += ' WHERE o.uid = ?';
            params.push(uid);
        }

        query += ' GROUP BY o.id ORDER BY o.created_at DESC';

        const [rows] = await pool.execute(query, params);
        const orders = rows as any[];

        return orders.map(order => ({
            id: order.id,
            uid: order.uid,
            licitacion: order.licitacion,
            fecha: order.fecha,
            numeroOrden: order.numero_orden,
            proveedor: order.proveedor,
            descripcion: order.descripcion,
            proyecto: order.proyecto,
            lugarEntrega: order.lugar_entrega,
            solicitante: order.solicitante,
            cedulaJuridica: order.cedula_juridica,
            estado: order.estado,
            fechaCreacion: order.created_at,
            fechaActualizacion: order.updated_at,
            items: order.items_json ? 
                JSON.parse(`[${order.items_json}]`).map((item: any) => ({
                    cantidad: item.cantidad,
                    unidad: item.unidad,
                    detalle: item.detalle,
                    cuenta: item.cuenta,
                    nombre: item.nombre,
                    costoUnitario: parseFloat(item.costoUnitario),
                    montoTotal: parseFloat(item.montoTotal)
                })) : []
        }));

    } catch (error) {
        console.error('Error obteniendo órdenes:', error);
        throw error;
    }
};

// Función para obtener una orden específica por ID
export const obtenerOrdenPorId = async (id: number, uid?: string): Promise<OrdenDeCompraResponse | null> => {
    try {
        let query = `
            SELECT 
                o.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', i.id,
                        'cantidad', i.cantidad,
                        'unidad', i.unidad,
                        'detalle', i.detalle,
                        'cuenta', i.cuenta,
                        'nombre', i.nombre,
                        'costoUnitario', i.costo_unitario,
                        'montoTotal', i.monto_total
                    )
                ) as items_json
            FROM buy_orders o
            LEFT JOIN buy_order_items i ON o.id = i.order_id
            WHERE o.id = ?
        `;

        const params: any[] = [id];

        if (uid) {
            query += ' AND o.uid = ?';
            params.push(uid);
        }

        query += ' GROUP BY o.id';

        const [rows] = await pool.execute(query, params);
        const orders = rows as any[];

        if (orders.length === 0) {
            return null;
        }

        const order = orders[0];
        return {
            id: order.id,
            uid: order.uid,
            licitacion: order.licitacion,
            fecha: order.fecha,
            numeroOrden: order.numero_orden,
            proveedor: order.proveedor,
            descripcion: order.descripcion,
            proyecto: order.proyecto,
            lugarEntrega: order.lugar_entrega,
            solicitante: order.solicitante,
            cedulaJuridica: order.cedula_juridica,
            estado: order.estado,
            fechaCreacion: order.created_at,
            fechaActualizacion: order.updated_at,
            items: order.items_json ? 
                JSON.parse(`[${order.items_json}]`).map((item: any) => ({
                    cantidad: item.cantidad,
                    unidad: item.unidad,
                    detalle: item.detalle,
                    cuenta: item.cuenta,
                    nombre: item.nombre,
                    costoUnitario: parseFloat(item.costoUnitario),
                    montoTotal: parseFloat(item.montoTotal)
                })) : []
        };

    } catch (error) {
        console.error('Error obteniendo orden por ID:', error);
        throw error;
    }
};

// Función para actualizar el estado de una orden
export const actualizarEstadoOrden = async (
    id: number, 
    estado: string, 
    uid?: string
): Promise<boolean> => {
    try {
        let query = 'UPDATE buy_orders SET estado = ? WHERE id = ?';
        const params: any[] = [estado, id];

        if (uid) {
            query += ' AND uid = ?';
            params.push(uid);
        }

        const [result] = await pool.execute(query, params);
        return (result as any).affectedRows > 0;

    } catch (error) {
        console.error('Error actualizando estado de orden:', error);
        throw error;
    }
};