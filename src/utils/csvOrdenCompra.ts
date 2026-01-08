import { getProjectFromAccount } from "@/utils/accountUtils";
import { store } from "@/store/store";
import { fetchBudgetAccounts } from "@/store/slices/budgetAccountsSlice";

export const generarCsvOrdenCompra = async (order: any) => {
    if (!order) throw new Error("❌ No se recibió una orden válida.");

    // ✅ Asegurar catálogo de cuentas cargado (para Nombre cuenta)
    const st0: any = store.getState();
    if (st0.budgetAccounts?.status === "idle") {
        await store.dispatch(fetchBudgetAccounts() as any);
    }

    const getAccountName = (code: string) => {
        const key = String(code ?? "").trim();
        const st: any = store.getState();
        return st.budgetAccounts?.map?.[key] || "—";
    };

    const fecha = order.date ? new Date(order.date).toLocaleDateString("es-CR") : "—";

    const deta1 = order.DETA1 || order.deta1 || "";
    const deta2 = order.DETA2 || order.deta2 || "";
    const conceptoCompleto = [deta1, deta2].filter(Boolean).join("\n") || "—";

    const proveedor = order.providerName || order.BENEFICIA || "—";
    const juridic = order.juridic || order.JURIDICA || "—";
    const solicitante = order.deta2a || order.requester || order.DETA2A || "—";
    const lugarEntrega = order.deta1a || order.DETA1A || "—";
    const proyecto = getProjectFromAccount(order.account);

    // --------------------- Helpers ---------------------
    const csvCell = (v: any) => {
        const s = String(v ?? "");
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
    };

    const money = (valor: number) =>
        `CRC ${Number(valor || 0).toLocaleString("es-CR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const toNumber = (v: any) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const normalizeItem = (it: any) => {
        const cantidad = toNumber(it.cantidad ?? it.CANT ?? it.quantity ?? 0);

        const detalle = it.detalle ?? it.DETALLE ?? it.detail ?? it.description ?? "—";
        const cuenta = String(it.cuenta ?? it.CUENTA ?? it.account ?? order.account ?? "—");
        const nombreCuenta = getAccountName(cuenta);

        const nombre = it.nombre ?? it.NOMBRE ?? it.itemName ?? "—";

        const monto = toNumber(it.montoTotal ?? it.MONTO ?? it.amount ?? it.total ?? 0);
        let unitario = toNumber(it.costoUnitario ?? it.UNITARIO ?? it.unitario ?? 0);

        if ((!unitario || unitario === 0) && cantidad > 0 && monto > 0) {
            unitario = +(monto / cantidad).toFixed(4);
        }

        const total = monto > 0 ? monto : +(cantidad * unitario).toFixed(2);

        return { cantidad, detalle, cuenta, nombreCuenta, nombre, unitario, total };
    };

    // --------------------- Items ---------------------
    const rawItems = Array.isArray(order.items) ? order.items : [];
    const items = rawItems.length > 0 ? rawItems.map(normalizeItem) : [normalizeItem(order)];

    const subtotal = items.reduce((acc: number, it: any) => acc + toNumber(it.total), 0);
    const renta = subtotal > 365000 ? subtotal * 0.02 : 0;
    const totalOrden = subtotal - renta;

    // --------------------- CSV Build ---------------------
    const lines: string[] = [];

    // Encabezado
    lines.push([csvCell("MUNICIPALIDAD CR")].join(","));
    lines.push([csvCell("ORDEN DE COMPRA POR BIENES Y SERVICIOS")].join(","));
    lines.push([csvCell(`No ${order.orderNumber || order.ORDEN || "—"}`), csvCell("Fecha"), csvCell(fecha)].join(","));
    lines.push("");

    // Datos generales
    lines.push([csvCell("DATOS GENERALES")].join(","));
    lines.push([csvCell("Obra/Proyecto"), csvCell(proyecto)].join(","));
    lines.push([csvCell("Proveedor"), csvCell(proveedor), csvCell("Cédula Física o Jurídica"), csvCell(juridic)].join(","));
    lines.push([csvCell("Solicitante"), csvCell(solicitante), csvCell("Lugar de entrega"), csvCell(lugarEntrega)].join(","));
    lines.push([csvCell("Concepto"), csvCell(conceptoCompleto)].join(","));
    lines.push("");

    // Detalle de ítems
    lines.push([csvCell("DETALLE DE ÍTEMS")].join(","));
    lines.push(
        [
            csvCell("Cant"),
            csvCell("Detalle"),
            csvCell("Cuenta"),
            csvCell("Nombre cuenta"),
            csvCell("Nombre"),
            csvCell("Unitario"),
            csvCell("Total"),
        ].join(",")
    );

    items.forEach((it: any) => {
        lines.push(
            [
                csvCell(it.cantidad),
                csvCell(it.detalle),
                csvCell(it.cuenta),
                csvCell(it.nombreCuenta),
                csvCell(it.nombre),
                csvCell(money(it.unitario)),
                csvCell(money(it.total)),
            ].join(",")
        );
    });

    lines.push("");

    // Totales
    lines.push([csvCell("TOTALES")].join(","));
    lines.push([csvCell("Subtotal"), csvCell(money(subtotal))].join(","));
    if (renta > 0) lines.push([csvCell("Renta 2%"), csvCell(money(renta))].join(","));
    lines.push([csvCell("Total orden"), csvCell(money(totalOrden))].join(","));
    lines.push("");

    // Forma de pago
    lines.push([csvCell("FORMA DE PAGO")].join(","));
    lines.push([
        csvCell("Esta orden carece de validez sin las firmas y sellos exigidos. Será remitida mediante el sistema de compras."),
    ].join(","));
    lines.push("");

    // Firmas
    lines.push([csvCell("FIRMAS")].join(","));
    lines.push([csvCell("Jefe de Proveeduría"), csvCell("Contador"), csvCell("Alcalde Municipal")].join(","));

    const csv = lines.join("\n");

    // --------------------- Download ---------------------
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `orden-${order.orderNumber || "sin-numero"}.csv`;
    link.click();

    URL.revokeObjectURL(url);
};
