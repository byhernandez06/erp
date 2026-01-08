/**
 * Agrupa las líneas de detalle por número de orden para generar PDFs completos.
 * @param lineas Lista plana de registros (cada uno representa una línea de la orden)
 * @returns Array de órdenes agrupadas, listas para el generador de PDF
 */
export const agruparLineasPorOrden = (lineas: any[]): any[] => {
    if (!Array.isArray(lineas)) return [];

    const agrupadas: Record<string, any> = {};

    for (const l of lineas) {
        const numeroOrden = l.orderNumber || l.orde1 || "sin-numero";

        if (!agrupadas[numeroOrden]) {
            agrupadas[numeroOrden] = {
                orderNumber: numeroOrden,
                date: l.date || null,
                providerName: l.providerName || l.BENEFICIA || "—",
                juridic: l.juridic || l.JURIDICA || "—",
                account: l.account || l.CUENTA || "",
                deta1: l.deta1 || "",
                deta2: l.deta2 || "",
                deta1a: l.deta1a || "",
                deta2a: l.deta2a || "",
                estado: l.estado || "",
                items: [],
            };
        }

        agrupadas[numeroOrden].items.push({
            quantity: Number(l.quantity || 0),
            detail: l.detail || l.DETALLE || "—",
            account: l.account || l.CUENTA || "—",
            itemName: l.itemName || l.NOMBRE || "—",
            UNITARIO: Number(l.amount || l.MONTO || 0) / (Number(l.quantity) || 1),
            MONTO: Number(l.amount || l.MONTO || 0),
        });
    }

    return Object.values(agrupadas);
};
