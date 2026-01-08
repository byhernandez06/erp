export interface CuentaNode {
    id: string;
    label: string;
    children: CuentaNode[];
    disponible?: number;
    recibe?: number;
}

export const buildCuentaTree = (cuentas: any[]): CuentaNode[] => {
    const map = new Map<string, CuentaNode>();

    // Crear nodos base
    cuentas.forEach((row) => {
        map.set(row.CUENTA, {
            id: row.CUENTA,
            label: row.DESCRI1,
            disponible: row.DISPONIBLE,
            recibe: row.RECIBE,
            children: [],
        });
    });

    // Armar jerarquía
    cuentas.forEach((row) => {
        const parts = row.CUENTA.split(".");
        if (parts.length === 1) return;

        const parent = row.CUENTA.split(".").slice(0, -1).join(".");

        if (map.has(parent)) {
            map.get(parent)!.children.push(map.get(row.CUENTA)!);
        }
    });

    // Solo raíces (no tienen padre)
    return [...map.values()].filter((n) => {
        const parts = n.id.split(".");
        if (parts.length === 1) return true;
        const parent = parts.slice(0, -1).join(".");
        return !map.has(parent);
    });
};
