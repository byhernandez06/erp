import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import OrdenDeCompraModal from "@/components/OrdenDeCompraModal";
import { getNextOrderNumber } from "@/api/orders";

import { generarPdfOrdenCompra } from "@/utils/pdfOrdenCompra";
import { agruparLineasPorOrden } from "@/utils/groupOrders";
import { generarCsvOrdenCompra } from "@/utils/csvOrdenCompra";
import { normalizeOrderForUI } from "@/utils/normalizeOrder";

import {
    fetchBudgetAccounts,
    selectBudgetAccountsStatus,
    // 👉 si no existe, abajo te dejo cómo crearlo
    selectBudgetAccountsMap,
} from "@/store/slices/budgetAccountsSlice";

import {
    fetchOrders,
    searchOrdersThunk,
    setOrdersQuery,
    clearOrdersQuery,
    selectOrders,
    selectOrdersQuery,
    selectOrdersStatus,
    selectOrdersIsSearching,
    selectOrdersError,
} from "@/store/slices/ordersSlice";

/* ------------------------------------------------------
   HELPERS
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
    allOrders: any[] | undefined,
    setPreviewPdf: (v: string | null) => void,
    setPreviewPdfName: (v: string) => void,
    getAccountName: (code: string) => string
) => {
    try {
        // 1) Orden completa (si viniera sin items)
        const ordenCompleta = obtenerOrdenCompleta(order, allOrders);

        if (!ordenCompleta.items || ordenCompleta.items.length === 0) {
            alert("Esta orden no contiene líneas para mostrar en el PDF.");
            return;
        }

        // 2) Normalizar items (derivar unitario desde MONTO/CANT)
        const ordenNormalizada = normalizeOrderForUI(ordenCompleta);

        // 3) Generar PDF con callback de nombre de cuenta
        const doc = generarPdfOrdenCompra(ordenNormalizada, true, getAccountName);

        // 4) Crear URL del blob
        const blob = doc.output("blob");
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

    const [previewPdf, setPreviewPdf] = useState<string | null>(null);
    const [previewPdfName, setPreviewPdfName] = useState("orden-sin-numero.pdf");

    const dispatch = useDispatch();

    // Redux: cuentas
    const budgetStatus = useSelector(selectBudgetAccountsStatus);
    const budgetMap = useSelector(selectBudgetAccountsMap);

    // Redux: órdenes
    const orders = useSelector(selectOrders);
    const ordersStatus = useSelector(selectOrdersStatus);
    const query = useSelector(selectOrdersQuery);
    const isSearching = useSelector(selectOrdersIsSearching);
    const ordersError = useSelector(selectOrdersError);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ✅ getter para el nombre de cuenta (sin store.getState)
    const getAccountName = (code: string) => {
        const key = String(code ?? "").trim();
        return (budgetMap && budgetMap[key]) ? budgetMap[key] : "—";
    };

    /* ------------------------- Carga inicial ------------------------ */
    useEffect(() => {
        if (ordersStatus === "idle") dispatch(fetchOrders() as any);
        if (budgetStatus === "idle") dispatch(fetchBudgetAccounts() as any);
    }, [ordersStatus, budgetStatus, dispatch]);

    /* ------------------------- Buscador global (debounce) ------------------------ */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const term = (query || "").trim();

            if (!term) {
                dispatch(fetchOrders() as any);
                return;
            }

            dispatch(searchOrdersThunk(term) as any);
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, dispatch]);

    /* ------------------------- Cleanup blob url ------------------------ */
    useEffect(() => {
        return () => {
            if (previewPdf) URL.revokeObjectURL(previewPdf);
        };
    }, [previewPdf]);

    /* ------------------------- Duplicar ------------------------ */
    const handleDuplicar = async (order: any) => {
        try {
            const completa = obtenerOrdenCompleta(order, orders);
            const ordenNormalizada = normalizeOrderForUI(completa);

            if (!ordenNormalizada.items?.length) {
                alert("No se puede duplicar: esta orden no tiene líneas.");
                return;
            }

            const copia = JSON.parse(JSON.stringify(ordenNormalizada));
            const next = await getNextOrderNumber();

            copia.orderNumber = String(next);
            copia.date = new Date().toISOString().substring(0, 10);

            copia.tipo = ordenNormalizada.tipo || ordenNormalizada.licitacion || "";
            copia.licitacion = ordenNormalizada.licitacion || ordenNormalizada.tipo || "";

            copia.providerName = ordenNormalizada.providerName || "";
            copia.activity = ordenNormalizada.activity || "";
            copia.juridic = ordenNormalizada.juridic || "";

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
                    <h2 className="text-[22px] font-bold">Órdenes</h2>

                    <div className="flex items-center gap-2 w-full md:w-[400px]">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por proveedor o número..."
                                value={query}
                                onChange={(e) => dispatch(setOrdersQuery(e.target.value) as any)}
                                className="w-full rounded-lg border pl-10 pr-3 py-2 text-sm"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>

                        {query && (
                            <button
                                onClick={() => dispatch(clearOrdersQuery() as any)}
                                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-100"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Estado / error */}
                {ordersError && (
                    <div className="mb-3 text-sm text-red-600">{ordersError}</div>
                )}

                {isSearching && query.trim() && (
                    <div className="mb-3 text-sm text-gray-500">
                        Buscando: <strong>{query}</strong>
                    </div>
                )}

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
                                orders.map((order: any, index: number) => (
                                    <ActivityRow
                                        key={`${order.orderNumber}-${index}`}
                                        order={order}
                                        total={getOrderTotal(order)}
                                        onPdf={() =>
                                            exportarPDFPreview(
                                                order,
                                                orders,
                                                setPreviewPdf,
                                                setPreviewPdfName,
                                                getAccountName
                                            )
                                        }
                                        onCsv={() => generarCsvOrdenCompra(normalizeOrderForUI(order))}
                                        onDuplicar={() => handleDuplicar(order)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        {ordersStatus === "loading" ? "Cargando..." : "No hay órdenes registradas."}
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
                    setSelectedOrder(null);
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
                    onPdf={() =>
                        exportarPDFPreview(
                            selectedOrder,
                            orders,
                            setPreviewPdf,
                            setPreviewPdfName,
                            getAccountName
                        )
                    }
                    onCsv={() => generarCsvOrdenCompra(normalizeOrderForUI(selectedOrder))}
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
    order,
    total,
    onPdf,
    onCsv,
    onDuplicar,
}: any) => (
    <tr className="border-t hover:bg-[#f8fafc]">
        <td className="px-4 py-3 text-sm font-semibold">{order?.orderNumber ?? "—"}</td>

        <td className="px-4 py-3 text-sm text-[#4c739a]">
            {order?.date ? new Date(order.date).toLocaleDateString() : "—"}
        </td>

        <td className="px-4 py-3 text-sm">{order?.providerName ?? "—"}</td>

        <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap">
            {formatCRC(total)}
        </td>

        <td className="px-4 py-3 text-sm text-right space-x-2">
            <button
                onClick={onPdf}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs"
            >
                PDF
            </button>

            <button
                onClick={onCsv}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs"
            >
                CSV
            </button>

            <button
                onClick={onDuplicar}
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
const DetalleOrdenModal = ({ order, onClose, onPdf, onCsv }: any) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-[480px] p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Detalle de Orden</h2>

            <div className="space-y-2 text-sm">
                <p><strong>Proveedor:</strong> {order?.providerName}</p>
                <p><strong>Fecha:</strong> {order?.date ? new Date(order.date).toLocaleDateString() : "—"}</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button
                    onClick={onCsv}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm"
                >
                    CSV
                </button>

                <button
                    onClick={onPdf}
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
