import React, { useState, useEffect, useRef } from "react";
import OrdenDeCompraModal from "@/components/OrdenDeCompraModal";
import { store } from "@/store/store";

import { getNextOrderNumber } from "@/api/orders";
import { generarPdfOrdenCompra } from "@/utils/pdfOrdenCompra";
import { agruparLineasPorOrden } from "@/utils/groupOrders";
import { generarCsvOrdenCompra } from "@/utils/csvOrdenCompra";
import { normalizeOrderForUI } from "@/utils/normalizeOrder";


import { useDispatch, useSelector } from "react-redux";
import { fetchBudgetAccounts, selectBudgetAccountsStatus } from "@/store/slices/budgetAccountsSlice";
import {
    fetchOrders,
    searchOrdersThunk,
    setSearchTerm,
    clearSearch,
    selectOrders,
    selectOrdersSearchTerm,
    selectOrdersStatus,
} from "@/store/slices/ordersSlice";



/* ------------------------------------------------------
   FUNCIÓN PARA EVITAR DUPLICAR ORDENES SIN ITEMS -> PDF
------------------------------------------------------ */
const obtenerOrdenCompleta = (order: any, allOrders?: any[]) => {
    const safeOrder = JSON.parse(JSON.stringify(order));
    let ordenCompleta = safeOrder;

    if ((!safeOrder.items || safeOrder.items.length === 0) && Array.isArray(allOrders)) {
        const grouped = agruparLineasPorOrden(allOrders);
        const encontrada = grouped.find((o: any) => o.orderNumber === safeOrder.orderNumber);
        if (encontrada) ordenCompleta = encontrada;
    }

    return ordenCompleta;
};


const toNumber = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const formatCRC = (v: number) =>
    `CRC ${Number(v || 0).toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getOrderTotal = (order: any) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    if (items.length) {
        return items.reduce(
            (acc: number, it: any) => acc + toNumber(it.MONTO ?? it.total ?? it.amount ?? 0),
            0
        );
    }
    return toNumber(order?.MONTO ?? order?.total ?? 0);
};



/* ------------------------------------------------------
   FUNCIÓN PARA PREVIEW DE PDF
------------------------------------------------------ */
const exportarPDFPreview = async (
    order: any,
    setPreviewPdf: any,
    setPreviewPdfName: any,
    allOrders?: any[]
) => {
    try {
        // 1) Orden completa (si hiciera falta reconstruir)
        const safeOrder = JSON.parse(JSON.stringify(order));
        let ordenCompleta = safeOrder;

        if ((!safeOrder.items || safeOrder.items.length === 0) && Array.isArray(allOrders)) {
            const grouped = agruparLineasPorOrden(allOrders);
            const encontrada = grouped.find((o: any) => o.orderNumber === safeOrder.orderNumber);
            if (encontrada) ordenCompleta = encontrada;
        }

        if (!ordenCompleta.items || ordenCompleta.items.length === 0) {
            alert("Esta orden no contiene líneas para mostrar en el PDF.");
            return;
        }

        // 2) Normalizar items (derivar unitario desde MONTO/CANT)
        const ordenNormalizada = normalizeOrderForUI(ordenCompleta);

        const getAccountName = (code: string) => {
            const key = String(code ?? "").trim();
            const st: any = store.getState();
            return st.budgetAccounts?.map?.[key] || "—";
        };

        // 3) Generar PDF con datos normalizados
        const doc = generarPdfOrdenCompra(ordenNormalizada, true, getAccountName);

        // 4) Crear URL del blob
        const blob = doc.output("blob"); // jsPDF devuelve Blob
        const url = URL.createObjectURL(blob);

        setPreviewPdf(url);
        setPreviewPdfName(`orden-${ordenNormalizada.orderNumber || "sin-numero"}.pdf`);
    } catch (err) {
        console.error("Error generando PDF:", err);
        alert("No se pudo generar el PDF.");
    }
};


/* ------------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------ */
const OrdenesCompraPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const dispatch = useDispatch();
    const status = useSelector(selectBudgetAccountsStatus);

    const orders = useSelector(selectOrders);
    const searchTerm = useSelector(selectOrdersSearchTerm);
    const ordersStatus = useSelector(selectOrdersStatus);

    const [previewPdf, setPreviewPdf] = useState<string | null>(null);
    const [previewPdfName, setPreviewPdfName] = useState("orden-sin-numero.pdf");

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchOrders() as any);
            dispatch(fetchBudgetAccounts() as any);
        }
    }, [ordersStatus, status, dispatch]);

    /* ------------------------- Buscador (debounce) ------------------------ */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const term = searchTerm.trim();

            if (!term) {
                dispatch(fetchOrders() as any);
                return;
            }

            dispatch(searchOrdersThunk(term) as any);
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchTerm, dispatch]);




    useEffect(() => {
        return () => {
            if (previewPdf) {
                URL.revokeObjectURL(previewPdf);
            }
        };
    }, [previewPdf]);



    /* ------------------------------------------------------
   FUNCIÓN CORREGIDA: DUPLICAR ORDEN
   (incluye tipo/licitación, proveedor, actividad, etc.)
------------------------------------------------------ */
    const handleDuplicar = async (order: any) => {
        try {
            // 1) Obtener la orden completa usando el array de Redux (orders)
            const completa = obtenerOrdenCompleta(order, orders);

            // 2) Normalizar items (deriva unitario si viene 0)
            const ordenNormalizada = normalizeOrderForUI(completa);

            if (!ordenNormalizada.items?.length) {
                alert("No se puede duplicar: esta orden no tiene líneas.");
                return;
            }

            // 3) Crear copia para el modal
            const copia = JSON.parse(JSON.stringify(ordenNormalizada));
            const next = await getNextOrderNumber();

            copia.orderNumber = String(next);
            copia.date = new Date().toISOString().substring(0, 10);

            // Mantener tipo/licitación
            copia.tipo = ordenNormalizada.tipo || ordenNormalizada.licitacion || "";
            copia.licitacion = ordenNormalizada.licitacion || ordenNormalizada.tipo || "";

            // Mantener proveedor / actividad / cédula
            copia.providerName = ordenNormalizada.providerName || "";
            copia.activity = ordenNormalizada.activity || "";
            copia.juridic = ordenNormalizada.juridic || "";

            // 4) Abrir modal con la copia
            setSelectedOrder(copia);
            setShowModal(true);
            setShowDetailModal(false);
        } catch (err) {
            alert("Error duplicando");
            console.error(err);
        }
    };




    return (
        <div className="flex flex-col w-full bg-slate-50 text-[#0d141b]">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-3 p-6 border-b bg-white">
                <h1 className="text-[32px] font-bold">Órdenes de Compra</h1>

                <button
                    onClick={() => {
                        setSelectedOrder(null);
                        setShowModal(true);
                    }}
                    className="rounded-lg bg-[#0d141b] text-white px-4 py-2 text-sm hover:bg-[#1c2530]"
                >
                    Nueva Orden
                </button>
            </div>

            {/* CONTENIDO */}
            <div className="px-6 py-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-4 gap-3">
                    <h2 className="text-[22px] font-bold">Actividad Reciente</h2>

                    <div className="flex items-center gap-2 w-full md:w-[400px]">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por proveedor o número..."
                                value={searchTerm}
                                onChange={(e) => dispatch(setSearchTerm(e.target.value) as any)}
                                className="w-full rounded-lg border pl-10 pr-3 py-2 text-sm"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>

                        {searchTerm && (
                            <button
                                onClick={() => dispatch(clearSearch() as any)}
                                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-100"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLA */}
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-[#f8fafc]">
                                <th className="px-4 py-3 text-left text-sm"># Orden</th>
                                <th className="px-4 py-3 text-left text-sm">Fecha</th>
                                <th className="px-4 py-3 text-left text-sm">Proveedor</th>
                                <th className="px-4 py-3 text-left text-sm">Monto</th>
                                <th className="px-4 py-3 text-left text-sm">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <ActivityRow
                                        key={`${order.orderNumber}-${index}`}
                                        orderNumber={order.orderNumber}
                                        date={order.date ? new Date(order.date).toLocaleDateString() : "—"}
                                        provider={order.providerName}
                                        total={getOrderTotal(order)}
                                        order={order}
                                        setPreviewPdf={setPreviewPdf}
                                        setPreviewPdfName={setPreviewPdfName}
                                        orders={orders}
                                        handleDuplicar={handleDuplicar}
                                        setSelectedOrder={setSelectedOrder}
                                        setShowDetailModal={setShowDetailModal}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 text-gray-500">
                                        No hay órdenes registradas.
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
                onClose={() => {
                    setShowModal(false);
                    setSelectedOrder(null);   // limpia orden previa
                }}
                initialOrder={selectedOrder}
            />

            {showDetailModal && selectedOrder && (
                <DetalleOrdenModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedOrder(null);
                    }}
                    setPreviewPdf={setPreviewPdf}
                    setPreviewPdfName={setPreviewPdfName}
                    orders={orders}
                />
            )}

            {previewPdf && (
                <PreviewPDFModal
                    pdfUrl={previewPdf}
                    fileName={previewPdfName}
                    onClose={() => {
                        URL.revokeObjectURL(previewPdf);
                        setPreviewPdf(null);
                    }}
                />
            )}
        </div>
    );
};

/* ------------------------------------------------------
   ROW DE LA TABLA
------------------------------------------------------ */
const ActivityRow = ({
    orderNumber,
    date,
    provider,
    total,
    order,
    setPreviewPdf,
    setPreviewPdfName,
    orders,
    handleDuplicar,
    setSelectedOrder,
    setShowDetailModal
}: any) => (
    <tr className="border-t hover:bg-[#f8fafc]">
        <td className="px-4 py-3 text-sm font-semibold">{orderNumber ?? "—"}</td>

        <td className="px-4 py-3 text-sm text-[#4c739a]">
            {date}
        </td>

        <td className="px-4 py-3 text-sm">
            {provider}
        </td>

        <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap">
            {formatCRC(total)}
        </td>

        <td className="px-4 py-3 text-sm text-right space-x-2">
            <button
                onClick={() => exportarPDFPreview(order, setPreviewPdf, setPreviewPdfName, orders)}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs"
            >
                PDF
            </button>

            <button
                onClick={() => generarCsvOrdenCompra(normalizeOrderForUI(order))}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs"
            >
                CSV
            </button>

            <button
                onClick={() => handleDuplicar(order)}
                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs"
            >
                Duplicar
            </button>
        </td>
    </tr>
);



/* ------------------------------------------------------
   MODAL DETALLE
------------------------------------------------------ */
const DetalleOrdenModal = ({ order, onClose, setPreviewPdf, setPreviewPdfName, orders }: any) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-[480px] p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Detalle de Orden</h2>

            <div className="space-y-2 text-sm">
                <p><strong>Proveedor:</strong> {order.providerName}</p>
                <p><strong>Descripción:</strong> {order.description}</p>
                <p><strong>Fecha:</strong> {new Date(order.date).toLocaleDateString()}</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button
                    onClick={async () => await generarCsvOrdenCompra(normalizeOrderForUI(order))}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm"
                >
                    CSV
                </button>

                <button
                    onClick={() => exportarPDFPreview(order, setPreviewPdf, setPreviewPdfName, orders)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
                >
                    Ver PDF
                </button>

                <button
                    onClick={onClose}
                    className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
                >
                    Cerrar
                </button>
            </div>
        </div>
    </div>
);

/* ------------------------------------------------------
   MODAL PDF PREVIEW
------------------------------------------------------ */
const PreviewPDFModal = ({ pdfUrl, fileName, onClose }: any) => {
    if (!pdfUrl) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[90%] h-[90%] shadow-lg flex flex-col">
                <div className="flex justify-between items-center border-b px-4 py-3 bg-slate-100">
                    <h3 className="text-lg font-semibold">Vista previa del PDF</h3>

                    <div className="flex gap-3">
                        <a
                            href={pdfUrl}
                            download={fileName || "orden-sin-numero.pdf"}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                        >
                            Descargar
                        </a>

                        <button
                            onClick={onClose}
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                <iframe src={pdfUrl} className="flex-1 w-full rounded-b-xl" />
            </div>
        </div>
    );
};

export default OrdenesCompraPage;
