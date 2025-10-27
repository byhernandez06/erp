import React, { useState, useEffect } from "react";
import OrdenDeCompraModal from "@/components/OrdenDeCompraModal";
import { obtenerOrdenesDeCompra } from "@/firebase/ordenesDeCompra";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/images/logo-oreamuno.png";

const ProveeduriaPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await obtenerOrdenesDeCompra();
            const estados = ["Pendiente", "En proceso", "Completado"];
            const withStatus = data.map((o: any) => ({
                ...o,
                estado: o.estado || estados[Math.floor(Math.random() * estados.length)],
            }));
            setOrders(withStatus);
        } catch (error) {
            console.error("Error cargando órdenes:", error);
        }
    };

    const handleView = (order: any) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    return (
        <div className="flex flex-col w-full bg-slate-50 text-[#0d141b]">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-3 p-6 border-b border-[#cfdbe7] bg-white">
                <h1 className="text-[32px] font-bold leading-tight tracking-[-0.015em]">
                    Órdenes de Compra
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg bg-[#0d141b] text-white px-4 py-2 text-sm font-medium hover:bg-[#1c2530] transition"
                >
                    Nueva Orden
                </button>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-white border-b border-[#cfdbe7]">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        className="px-3 py-2 border border-[#cfdbe7] rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <select className="px-3 py-2 border border-[#cfdbe7] rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option>Todos los estados</option>
                        <option>Pendiente</option>
                        <option>En proceso</option>
                        <option>Completado</option>
                    </select>
                </div>
                <button className="rounded-lg border border-[#cfdbe7] px-4 py-2 text-sm hover:bg-[#f1f5f9] transition">
                    Filtrar
                </button>
            </div>

            {/* RESUMEN */}
            <div className="px-6 py-6">
                <h2 className="text-[22px] font-bold pb-3">Resumen de Órdenes</h2>
                <div className="flex flex-wrap gap-4">
                    <SummaryCard
                        title="Total de Órdenes"
                        value={orders.length.toString()}
                    />
                    <SummaryCard
                        title="Órdenes Pendientes"
                        value={orders.filter((o) => o.estado === "Pendiente").length.toString()}
                    />
                    <SummaryCard
                        title="Órdenes Completadas"
                        value={orders.filter((o) => o.estado === "Completado").length.toString()}
                    />
                </div>
            </div>

            {/* TABLA DE ACTIVIDAD */}
            <div className="px-6 pb-8">
                <h2 className="text-[22px] font-bold pb-3">Actividad Reciente</h2>
                <div className="overflow-hidden rounded-lg border border-[#cfdbe7] bg-white">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-[#f8fafc]">
                                <th className="px-4 py-3 text-left text-sm font-medium w-[150px]">Fecha</th>
                                <th className="px-4 py-3 text-left text-sm font-medium w-[200px]">Proveedor</th>
                                <th className="px-4 py-3 text-left text-sm font-medium w-[300px]">Descripción</th>
                                <th className="px-4 py-3 text-left text-sm font-medium w-[120px]">Estado</th>
                                <th className="px-4 py-3 text-left text-sm font-medium w-[80px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <ActivityRow
                                        key={order.id}
                                        date={
                                            order.fechaCreacion?.toDate
                                                ? order.fechaCreacion.toDate().toLocaleDateString()
                                                : "—"
                                        }
                                        provider={order.proveedor || "Sin proveedor"}
                                        description={order.descripcion || "Sin descripción"}
                                        status={order.estado}
                                        onView={() => handleView(order)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        No hay órdenes registradas todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALES */}
            <OrdenDeCompraModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />

            {showDetailModal && selectedOrder && (
                <DetalleOrdenModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};

/* -------- COMPONENTES -------- */

interface SummaryCardProps {
    title: string;
    value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdbe7] bg-white shadow-sm">
        <p className="text-[#0d141b] text-base font-medium">{title}</p>
        <p className="text-[#0d141b] text-2xl font-bold">{value}</p>
    </div>
);

interface ActivityRowProps {
    date: string;
    provider: string;
    description: string;
    status: string;
    onView: () => void;
}

const ActivityRow: React.FC<ActivityRowProps> = ({
    date,
    provider,
    description,
    status,
    onView,
}) => (
    <tr className="border-t border-[#cfdbe7] hover:bg-[#f8fafc] transition">
        <td className="px-4 py-3 text-[#4c739a] text-sm">{date}</td>
        <td className="px-4 py-3 text-sm">{provider}</td>
        <td className="px-4 py-3 text-[#4c739a] text-sm">{description}</td>
        <td className="px-4 py-3 text-sm">
            <StatusBadge status={status} />
        </td>
        <td className="px-4 py-3 text-sm text-right">
            <button
                onClick={onView}
                className="text-blue-600 hover:text-blue-800 font-medium"
            >
                Ver
            </button>
        </td>
    </tr>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = {
        Completado: "bg-green-100 text-green-700",
        "En proceso": "bg-yellow-100 text-yellow-700",
        Pendiente: "bg-red-100 text-red-700",
    };
    return (
        <span
            className={`px-3 py-1 rounded-lg text-sm font-medium ${colors[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status}
        </span>
    );
};

/* -------- MODAL DE DETALLE -------- */

interface DetalleOrdenModalProps {
    order: any;
    onClose: () => void;
}

const DetalleOrdenModal: React.FC<DetalleOrdenModalProps> = ({
    order,
    onClose,
}) => {
    const handleExportCSV = () => {
        const csv = `Proveedor,Descripción,Estado,Fecha\n"${order.proveedor}","${order.descripcion}","${order.estado}","${order.fechaCreacion?.toDate
            ? order.fechaCreacion.toDate().toLocaleDateString()
            : ""
            }"`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `orden-${order.id}.csv`;
        link.click();
    };

    const handleExportPDF = () => {
        const doc = new jsPDF("p", "pt", "a4");

        const marginX = 40;
        let y = 60;

        // ---- LOGO ----
        try {
            doc.addImage(logo, "PNG", marginX, 20, 60, 60); // x, y, width, height
        } catch (err) {
            console.warn("No se pudo cargar el logo:", err);
        }

        // ---- ENCABEZADO ----
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("ORDEN DE COMPRA", marginX + 80, 55); // desplazamos a la derecha del logo

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        y += 30;

        // ---- DATOS GENERALES ----
        const datosGenerales = [
            ["Número de orden:", order.numeroOrden || "—"],
            ["Fecha:", order.fecha || (order.fechaCreacion?.toDate ? order.fechaCreacion.toDate().toLocaleDateString() : "—")],
            ["Proveedor:", order.proveedor || "—"],
            ["Cédula Jurídica:", order.cedulaJuridica || "—"],
            ["Licitación:", order.licitacion || "—"],
            ["Proyecto:", order.proyecto || "—"],
            ["Lugar de Entrega:", order.lugarEntrega || "—"],
            ["Solicitante:", order.solicitante || "—"],
            ["Descripción:", order.descripcion || "—"],
            ["Estado:", order.estado || "—"],
        ];

        autoTable(doc, {
            startY: y + 50,
            theme: "grid",
            head: [["Campo", "Valor"]],
            body: datosGenerales,
            styles: { fontSize: 10, cellPadding: 5, valign: "middle" },
            headStyles: { fillColor: [19, 128, 236], textColor: 255 },
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 130 },
                1: { cellWidth: 370 },
            },
        });

        y = (doc as any).lastAutoTable.finalY + 25;

        // ---- DETALLE DE ÍTEMS ----
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Detalle de Ítems", marginX, y);
        y += 10;

        const items = (order.items || []).map((item: any, idx: number) => [
            idx + 1,
            item.nombre || "—",
            item.detalle || "—",
            item.cantidad || 0,
            item.unidad || "—",
            item.cuenta || "—",
            item.costoUnitario?.toFixed(2) || "0.00",
            item.montoTotal?.toFixed(2) || "0.00",
        ]);

        autoTable(doc, {
            startY: y,
            head: [["#", "Nombre", "Detalle", "Cant.", "Unidad", "Cuenta", "Costo U.", "Monto Total"]],
            body: items.length > 0 ? items : [["—", "—", "—", "—", "—", "—", "—", "—"]],
            theme: "striped",
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [19, 128, 236], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 90 },
                2: { cellWidth: 100 },
                3: { cellWidth: 40 },
                4: { cellWidth: 55 },
                5: { cellWidth: 60 },
                6: { cellWidth: 60, halign: "right" },
                7: { cellWidth: 70, halign: "right" },
            },
        });

        y = (doc as any).lastAutoTable.finalY + 20;

        // ---- TOTAL GENERAL ----
        const total = (order.items || []).reduce(
            (acc: number, item: any) => acc + (Number(item.montoTotal) || 0),
            0
        );
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total general: ₡ ${total.toFixed(2)}`, marginX, y);

        y += 60;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("_____________________________________", marginX, y);
        doc.text("Firma y sello de aprobación", marginX, y + 15);

        // ---- PIE DE PÁGINA ----
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(
            "Documento generado automáticamente por el sistema de Proveeduría",
            marginX,
            820
        );

        doc.save(`orden-${order.numeroOrden || order.id || "sin-numero"}.pdf`);
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
                <h2 className="text-xl font-semibold mb-4">Detalle de Orden</h2>
                <div className="space-y-2 text-sm">
                    <p>
                        <strong>Proveedor:</strong> {order.proveedor || "—"}
                    </p>
                    <p>
                        <strong>Descripción:</strong> {order.descripcion || "—"}
                    </p>
                    <p>
                        <strong>Estado:</strong> {order.estado || "—"}
                    </p>
                    <p>
                        <strong>Fecha:</strong>{" "}
                        {order.fechaCreacion?.toDate
                            ? order.fechaCreacion.toDate().toLocaleDateString()
                            : "—"}
                    </p>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={handleExportCSV}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                    >
                        Exportar CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                    >
                        Exportar PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProveeduriaPage;
