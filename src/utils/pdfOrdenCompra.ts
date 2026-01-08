import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getProjectFromAccount } from "@/utils/accountUtils";
import logo from "@/assets/images/logo-muni.png";

/**
 * Genera un PDF con formato oficial municipal para una orden de compra.
 * Compatible con estructura no normalizada y con items normalizados.
 * @param order Objeto con la información de la orden
 * @param soloPreview Si es true, devuelve el doc sin guardarlo
 */
export const generarPdfOrdenCompra = (
    order: any,
    soloPreview: boolean = false,
    getAccountName?: (code: string) => string
): jsPDF => {
    if (!order) throw new Error("❌ No se recibió una orden válida.");

    console.log("Order: ", order);

    const doc = new jsPDF("p", "pt", "a4");
    const marginX = 40;
    let y = 35;

    /* ------------------- ENCABEZADO ------------------- */
    try {
        doc.addImage(logo, "PNG", marginX, y, 60, 60);
    } catch (err) {
        console.warn("⚠️ No se pudo cargar el logo:", err);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("MUNICIPALIDAD CR", marginX + 75, y + 10);
    doc.setFontSize(11);
    doc.text("ORDEN DE COMPRA POR BIENES Y SERVICIOS", marginX + 75, y + 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Cédula Jurídica Nº 3-014-042685", marginX + 75, y + 42);
    doc.text("Tel: 2551-0730 ext. 140   Email: karol.sanabria@municr.go.cr", marginX + 75, y + 54);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Página 1", 485, y + 8);
    doc.setTextColor(200, 0, 0);
    doc.text(`No ${order.orderNumber || order.ORDEN || "—"}`, 485, y + 26);
    doc.setTextColor(0);

    /* ------------------- DATOS GENERALES ------------------- */
    y += 75;
    const fecha = order.date ? new Date(order.date).toLocaleDateString() : "—";
    const deta1 = order.DETA1 || order.deta1 || "";
    const deta2 = order.DETA2 || order.deta2 || "";
    const conceptoCompleto = [deta1, deta2].filter(Boolean).join("\n");
    const proyecto = getProjectFromAccount(order.account);

    const datosGenerales = [
        ["Fecha:", fecha, "Obra/Proyecto:", proyecto],
        [
            "Proveedor:",
            order.providerName || order.BENEFICIA || "—",
            "Cédula Física o Jurídica:",
            order.juridic || order.JURIDICA || "—",
        ],
        [
            "Solicitante:",
            order.deta2a || order.requester || order.DETA2A || "—",
            "Lugar de entrega:",
            order.deta1a || order.DETA1A || "—",
        ],
        ["Concepto:", conceptoCompleto || "—", "", ""],
    ];

    autoTable(doc, {
        startY: y,
        body: datosGenerales,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 75 },
            1: { cellWidth: 170 },
            2: { fontStyle: "bold", cellWidth: 110 },
            3: { cellWidth: 135 },
        },
    });

    y = (doc as any).lastAutoTable.finalY + 14;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Número de orden de pedido ${order.orderNumber || order.ORDEN || "—"}`, marginX, y);
    y += 18;

    /* ------------------- DETALLE DE ÍTEMS ------------------- */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Por cuenta de esta Municipalidad para efectos:", marginX, y);
    y += 10;

    let items: any[] = [];

    try {
        // 🔹 Clonamos para evitar referencias reactivas
        const rawItems = JSON.parse(JSON.stringify(order.items || []));

        const mapItemToRow = (it: any) => {
            // ✅ Soporta formato nuevo y viejo
            const cant = Number(it.cantidad ?? it.CANT ?? it.quantity ?? 0);

            const detalle = it.detalle ?? it.DETALLE ?? it.detail ?? it.description ?? "—";
            const cuenta = it.cuenta ?? it.CUENTA ?? it.account ?? "—";
            const nombreCuenta = getAccountName ? getAccountName(cuenta) : "—";
            const nombre = it.nombre ?? it.NOMBRE ?? it.itemName ?? "—";

            const unitarioNum = Number(it.costoUnitario ?? it.UNITARIO ?? it.unitario ?? 0);
            const totalNum = Number(it.montoTotal ?? it.MONTO ?? it.amount ?? it.total ?? 0);

            return [
                cant > 0 ? cant : "—",
                detalle || "—",
                cuenta || "—",
                nombreCuenta,
                nombre || "—",
                formatearColones(unitarioNum),
                formatearColones(totalNum),
            ];
        };

        if (Array.isArray(rawItems) && rawItems.length > 0) {
            console.log("✅ Items recibidos para PDF:", rawItems);
            items = rawItems.map(mapItemToRow);
        } else {
            // 🔹 Fallback: solo una línea si no hay items
            items = [[
                Number(order.cantidad ?? order.CANT ?? order.quantity ?? 0) || "—",
                order.detalle ?? order.DETALLE ?? order.description ?? "—",
                order.cuenta ?? order.CUENTA ?? order.account ?? "—",
                order.nombre ?? order.NOMBRE ?? order.itemName ?? "—",
                formatearColones(Number(order.costoUnitario ?? order.UNITARIO ?? 0)),
                formatearColones(Number(order.montoTotal ?? order.MONTO ?? 0)),
            ]];
        }
    } catch (err) {
        console.error("💥 Error al preparar items para PDF:", err);
    }

    autoTable(doc, {
        startY: y + 8,
        head: [["Cant", "Detalle", "Cuenta", "Nombre cuenta", "Nombre", "Unitario", "Total"]],
        body: items,
        theme: "grid",
        styles: {
            fontSize: 8,          // baja 1pt ayuda muchísimo
            cellPadding: 2,
            valign: "middle",
            overflow: "linebreak" // permite saltos de línea
        },
        headStyles: { fillColor: [245, 245, 245], textColor: 0 },
        columnStyles: {
            0: { cellWidth: 30, halign: "center" }, // Cant
            1: { cellWidth: 140 },                  // Detalle
            2: { cellWidth: 70, overflow: "ellipsize" }, // Cuenta (código)
            3: { cellWidth: 120 },                  // Nombre cuenta
            4: { cellWidth: 65 },                   // Nombre (item)
            5: { cellWidth: 45, halign: "right" },  // Unitario
            6: { cellWidth: 45, halign: "right" },  // Total
        },
    });


    /* ------------------- TOTALES ------------------- */
    const subtotal = Array.isArray(order.items)
        ? order.items.reduce((acc: number, it: any) => {
            const total = Number(it.montoTotal ?? it.MONTO ?? it.total ?? it.amount ?? 0);
            return acc + total;
        }, 0)
        : Number(order.montoTotal ?? order.MONTO ?? 0) || 0;

    const renta = subtotal > 365000 ? subtotal * 0.02 : 0;
    const totalOrden = subtotal - renta;
    y = (doc as any).lastAutoTable.finalY + 25;

    // 🔹 Caja gris
    const boxX = 330;
    const boxWidth = 220;
    const boxHeight = renta > 0 ? 65 : 50;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(boxX, y - 12, boxWidth, boxHeight, 4, 4, "F");

    const textXLeft = boxX + 25;
    const textXRight = boxX + boxWidth - 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let lineY = y + 5;
    doc.text("Subtotal", textXLeft, lineY);
    doc.text(formatearColones(subtotal), textXRight, lineY, { align: "right" });

    if (renta > 0) {
        lineY += 16;
        doc.text("Renta 2%", textXLeft, lineY);
        doc.text(formatearColones(renta), textXRight, lineY, { align: "right" });
    }

    lineY += 18;
    doc.setFont("helvetica", "bold");
    doc.text("Total orden", textXLeft, lineY);
    doc.text(formatearColones(totalOrden), textXRight, lineY, { align: "right" });

    /* ------------------- FORMA DE PAGO ------------------- */
    y = lineY + 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FORMA DE PAGO:", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        "Esta orden carece de validez sin las firmas y sellos exigidos. Será remitida mediante el sistema de compras.",
        marginX,
        y,
        { maxWidth: 520 }
    );

    /* ------------------- FIRMAS ------------------- */
    y += 60;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(
        "Certifico que el presente documento ha sido revisado y aprobado conforme a la normativa municipal vigente.",
        marginX,
        y,
        { maxWidth: 520 }
    );

    y += 40;
    const firmaW = 160;
    const gap = 50;

    doc.setDrawColor(100);
    doc.line(marginX, y, marginX + firmaW, y);
    doc.line(marginX + firmaW + gap, y, marginX + 2 * firmaW + gap, y);
    doc.line(marginX + 2 * (firmaW + gap), y, marginX + 3 * firmaW + 2 * gap - 20, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Jefe de Proveeduría", marginX + 20, y);
    doc.text("Contador", marginX + firmaW + gap + 55, y);
    doc.text("Alcalde Municipal", marginX + 2 * (firmaW + gap) + 30, y);

    if (!soloPreview) {
        const fileName = `orden-${order.orderNumber || "sin-numero"}.pdf`;
        doc.save(fileName);
    }

    return doc;
};

/* ------------------- HELPER ------------------- */
const formatearColones = (valor: number): string => {
    const num = valor.toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `CRC ${num}`;
};
