// /src/components/OrdenDeCompraModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createOrder, getNextOrderNumber } from "@/api/orders";
import { getAllVendors } from "@/api/vendors";
import { getAllBudgetAccounts } from "@/api/catapresu";
import { getAllLicitaciones } from "@/api/licitaciones";
import {
    proyectos,
    // generarSaldoAleatorio,
    formatearColones,
} from "@/data/staticData";

interface OrdenDeCompraModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialOrder?: any;
}

interface Item {
    cantidad: number;
    unidad: string;
    detalle: string;
    cuenta: string; // cuenta del ítem (editable)
    nombre: string;
    costoUnitario: number;
    montoTotal: number;
}

interface PartidaPresupuestaria {
    CUENTA: string;
    DESCRI1: string;
    DISPONIBLE: number;
    TOTAL1: number;
    COMPROMETI: number;
}

type Vendor = {
    id: number | string;
    name: string;
    legalStatus?: string;
    activity?: string;
    budgetAccount?: string; // CUENTA sugerida
};

// Helpers
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Normaliza string de cuenta a formato punteado, p. ej. "5.01.03.0.01" */
const formatCuentaDots = (raw?: string) => {
    if (!raw) return "";
    if (/^\d+(\.\d+)*$/.test(raw)) return raw; // ya punteada
    const dotted = raw
        .replace(/[^\d]+/g, ".")
        .replace(/\.+/g, ".")
        .replace(/^\./, "")
        .replace(/\.$/, "");
    return dotted;
};

// normaliza texto para búsqueda simple
const norm = (s: string) =>
    (s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const unidadesMedida = [
    "UNIDAD",
    "CAJA",
    "PAQUETE",
    "BULTO",
    "SACO",
    "METRO",
    "METRO CUADRADO",
    "METRO CÚBICO",
    "KILOGRAMO",
    "GRAMO",
    "LITRO",
    "MILILITRO",
    "GALÓN",
    "PAR",
    "DOCENA",
    "CARTÓN",
    "Rollo",
    "Horas",
    "DÍA",
    "SERVICIO",
];

const OrdenDeCompraModal: React.FC<OrdenDeCompraModalProps> = ({ isOpen, onClose, initialOrder }) => {
    const [saldoDisponible, setSaldoDisponible] = useState<number>(0);
    const [saldoOriginal, setSaldoOriginal] = useState<number>(0);

    const [form, setForm] = useState<{
        licitacion: string;
        fecha: string;
        numeroOrden: string;
        proveedor: string;
        descripcion: string;
        proyecto: string;
        actividad: string;
        lugarEntrega: string;
        solicitante: string;
        cedulaJuridica: string;
        cuentaPresupuestaria: string;
        saldoCuenta: number;
        items: Item[];
    }>({
        licitacion: "",
        fecha: "",
        numeroOrden: "",
        proveedor: "",
        descripcion: "",
        proyecto: "",
        actividad: "",
        lugarEntrega: "",
        solicitante: "",
        cedulaJuridica: "",
        cuentaPresupuestaria: "",
        saldoCuenta: 0,
        items: [],
    });

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorSearch, setVendorSearch] = useState("");
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);

    const [actividadSearch, setActividadSearch] = useState("");
    const [showActividadDropdown, setShowActividadDropdown] = useState(false);


    const [showCuentaDropdown, setShowCuentaDropdown] = useState(false);
    const [todasLasCuentas, setTodasLasCuentas] = useState<PartidaPresupuestaria[]>([]);
    const [cuentaSearch, setCuentaSearch] = useState("");

    const [unidadSearch, setUnidadSearch] = useState("");
    const [showUnidadDropdown, setShowUnidadDropdown] = useState(false);
    const [detallePartida, setDetallePartida] = useState<any>(null);

    const [licitaciones, setLicitaciones] = useState<{ tipo: string; consecu: number | null }[]>([]);
    const [catalogosListos, setCatalogosListos] = useState(false);

    // Cerrar dropdowns haciendo click afuera
    useEffect(() => {
        const handleOutside = () => {
            setShowVendorDropdown(false);
            setShowActividadDropdown(false);
            setShowCuentaDropdown(false);
            setShowUnidadDropdown(false);
        };
        window.addEventListener("click", handleOutside);
        return () => window.removeEventListener("click", handleOutside);
    }, []);


    // Recalcular saldo disponible por items
    useEffect(() => {
        const totalGastado = form.items.reduce((total, item) => total + (item.montoTotal || 0), 0);
        setSaldoDisponible(saldoOriginal - totalGastado);
    }, [form.items, saldoOriginal]);

    // Solo asigna cuenta global si el item NO tiene cuenta personalizada
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((it) => ({
                ...it,
                cuenta: it.cuenta || prev.cuentaPresupuestaria,
            })),
        }));
    }, [form.cuentaPresupuestaria]);

    // --- Filtro local de cuentas (sin llamadas al backend) ---
    const cuentasFiltradasLocal = useMemo(() => {
        const q = norm(cuentaSearch.trim());

        // Prefijos permitidos para generar Orden de Compra
        const prefijosPermitidos = ["5.01", "5.02", "5.05"];
        // Si después necesitás más, solo los agregás aquí.

        // Filtramos primero SOLO cuentas válidas
        let cuentasValidas = todasLasCuentas.filter((c) =>
            prefijosPermitidos.some((p) => c.CUENTA.startsWith(p))
        );

        // Luego aplicamos búsqueda si hay texto
        if (q) {
            cuentasValidas = cuentasValidas.filter((c) => {
                const inCuenta = norm(c.CUENTA).includes(q);
                const inDescri = norm(c.DESCRI1).includes(q);
                return inCuenta || inDescri;
            });
        }

        return cuentasValidas;
    }, [cuentaSearch, todasLasCuentas]);


    // 🧩 Cargar catálogos SIEMPRE que se abra el modal
    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            try {
                // Cargar todo en paralelo
                const [list, cuentas, licits] = await Promise.all([
                    getAllVendors(),
                    getAllBudgetAccounts(),
                    getAllLicitaciones(),
                ]);

                setVendors(list as Vendor[]);
                console.log("Cuentas mapping: ", cuentas)
                const data = cuentas as PartidaPresupuestaria[];
                data.sort((a, b) => a.CUENTA.localeCompare(b.CUENTA));
                setTodasLasCuentas(data);

                setLicitaciones(licits);

                setCatalogosListos(true);

                // 🟡 Solo generar nuevo número si NO es duplicado
                if (!initialOrder) {
                    const next = await getNextOrderNumber();
                    setForm(prev => ({ ...prev, numeroOrden: String(next) }));
                }
            } catch (e) {
                console.error(e);
                setMensaje("No se pudo cargar catálogos iniciales.");
                setTimeout(() => setMensaje(null), 2500);
            }
        })();
    }, [isOpen, initialOrder]);


    // 🟢 LIMPIAR FORM CUANDO ES NUEVA ORDEN
    useEffect(() => {
        if (!isOpen) return;

        // Si initialOrder es null → es una orden nueva → limpiar todo
        if (!initialOrder) {
            resetForm();

            // Y si ya cargaron catálogos, generar número nuevo
            if (catalogosListos) {
                (async () => {
                    const next = await getNextOrderNumber();
                    setForm(prev => ({ ...prev, numeroOrden: String(next) }));
                })();
            }

            return; // ⛔ evita que los demás efectos metan datos viejos
        }
    }, [isOpen, initialOrder, catalogosListos]);



    // 🔧 Rellenar form al duplicar, PERO esperar a que carguen vendors y catálogos
    useEffect(() => {
        if (!isOpen) return;
        if (!initialOrder) return;

        // Esperar a que catálogos estén listos
        if (!catalogosListos) return;

        // Esperar a que proveedores estén cargados
        if (!vendors.length) return;

        const o = initialOrder;

        // 🟢 Buscar proveedor dentro del listado
        const proveedorObj = vendors.find(
            (v) =>
                v.name.trim().toLowerCase() ===
                (o.providerName || "").trim().toLowerCase()
        );

        const actividadProveedor = proveedorObj?.activity || "";

        setForm(prev => ({
            ...prev,
            licitacion: o.licitacion || o.tipo || "",
            fecha: (o.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
            numeroOrden: o.orderNumber,
            proveedor: o.providerName || "",
            descripcion: [
                (o.deta1 || o.deta1a || "").trim(),
                (o.deta2 || o.deta2a || "").trim()
            ].filter(Boolean).join("\n"),
            proyecto: o.project || "",
            actividad: actividadProveedor,
            lugarEntrega: o.deliveryPlace || o.deta1a || "",
            solicitante: o.requester || o.deta2a || "",
            cedulaJuridica: o.juridic || "",
            cuentaPresupuestaria: o.account || "",
            saldoCuenta: 0,
            items: (o.items || []).map((i: any) => {
                const cantidad = Number(i.cantidad ?? i.CANT ?? 0);
                const costoUnitario = Number(i.costoUnitario ?? i.UNITARIO ?? 0);

                return {
                    cantidad,
                    unidad: i.unidad || i.UNIDAD || "",
                    detalle: i.detalle || i.DETALLE || "",
                    cuenta: i.cuenta || i.CUENTA || o.account || "",
                    nombre: i.nombre || i.NOMBRE || "",
                    costoUnitario,
                    montoTotal: Number(i.montoTotal ?? (cantidad * costoUnitario)),
                };
            }),
        }));
    }, [
        isOpen,
        initialOrder,
        catalogosListos,  // asegura que catálogos están listos
        vendors            // asegura que proveedores ya cargaron
    ]);


    useEffect(() => {
        if (!isOpen || !initialOrder) return;
        if (!initialOrder.account) return;
        if (!todasLasCuentas.length) return;

        aplicarCuentaYSaldo(initialOrder.account);
    }, [isOpen, initialOrder, todasLasCuentas]);


    // --- Acciones principales ---

    // Cargar saldo de una cuenta (y asegurar formato con puntos)
    const aplicarCuentaYSaldo = (cuentaRaw: string) => {
        const cuenta = formatCuentaDots(cuentaRaw);

        const detalle = todasLasCuentas.find((c) => c.CUENTA === cuenta);
        const disponible = Number(detalle?.DISPONIBLE || 0);

        setDetallePartida(detalle);

        setForm((prev) => ({
            ...prev,
            cuentaPresupuestaria: cuenta,
            saldoCuenta: disponible,
            items: prev.items.map((i) => ({
                ...i,
                cuenta: i.cuenta || cuenta,  // Solo usa la global si el ítem no tiene una definida
            })),
        }));


        // Sincroniza saldos globales
        setSaldoOriginal(disponible);

        // Recalcula disponible restando ítems ya agregados
        const gastado = form.items.reduce((acc, i) => acc + (i.montoTotal || 0), 0);
        setSaldoDisponible(disponible - gastado);
    };

    // Al seleccionar proveedor (sin búsquedas automáticas de cuentas)
    const onProveedorSeleccionado = async (vendor: Vendor) => {
        setForm((prev) => ({
            ...prev,
            proveedor: vendor.name,
            cedulaJuridica: vendor.legalStatus || "",
            actividad: vendor.activity || "",
        }));

        // Si el proveedor trae CUENTA sugerida, la aplicamos
        if (vendor.budgetAccount) {
            await aplicarCuentaYSaldo(vendor.budgetAccount);
        }
    };

    // Handle genérico de cambios
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === "proveedor") {
            const vendor = vendors.find((v) => v.name === value);
            if (vendor) onProveedorSeleccionado(vendor);
            else setForm((prev) => ({ ...prev, proveedor: value }));
            return;
        }

        if (name === "cuentaPresupuestaria") {
            aplicarCuentaYSaldo(value);
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Ítems (edición en la tabla)
    const handleItemChange = (index: number, field: keyof Item, value: any) => {
        setForm((prev) => {
            const updatedItems = [...prev.items];

            // Permite editar cuenta libremente sin afectar cálculos
            if (field === "cuenta") {
                updatedItems[index].cuenta = value;
                return { ...prev, items: updatedItems };
            }

            // Campo normal (cantidad, unidad, detalle, nombre, costo)
            updatedItems[index] = { ...updatedItems[index], [field]: value };

            // Si cambia cantidad o costo recalcular total
            if (field === "cantidad" || field === "costoUnitario") {
                const cantidad = Number(updatedItems[index].cantidad) || 0;
                const costoU = Number(updatedItems[index].costoUnitario) || 0;
                const nuevoMontoTotal = cantidad * costoU;

                const totalOtrosItems = updatedItems.reduce((total, item, idx) => {
                    if (idx === index) return total;
                    return total + (item.montoTotal || 0);
                }, 0);

                const saldoRestante = saldoOriginal - totalOtrosItems;
                if (nuevoMontoTotal > saldoRestante) {
                    setMensaje("⚠️ No se puede agregar este ítem. Excede el saldo disponible.");
                    setTimeout(() => setMensaje(null), 3000);
                    return prev;
                }

                updatedItems[index].montoTotal = nuevoMontoTotal;
            }

            return { ...prev, items: updatedItems };
        });
    };


    // --- Nuevo ítem (formulario de alta) ---
    const [newItem, setNewItem] = useState<Omit<Item, "montoTotal">>({
        cantidad: 0,
        unidad: "",
        detalle: "",
        cuenta: "",
        nombre: "",
        costoUnitario: 0,
    });

    const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddItem = (item = newItem) => {
        const cantidad = Number(item.cantidad) || 0;
        const costoU = Number(item.costoUnitario) || 0;

        const nuevo: Item = {
            ...item,
            // Si el usuario no escribió cuenta, se usa la cuenta global
            cuenta: item.cuenta || form.cuentaPresupuestaria,
            montoTotal: cantidad * costoU,
        };

        setForm((prev) => ({ ...prev, items: [...prev.items, nuevo] }));

        setNewItem({
            cantidad: 0,
            unidad: "",
            detalle: "",
            cuenta: form.cuentaPresupuestaria,
            nombre: "",
            costoUnitario: 0,
        });
    };

    const handleRemoveItem = (index: number) => {
        setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const resetForm = () => {
        setForm({
            licitacion: "",
            fecha: "",
            numeroOrden: "",
            proveedor: "",
            descripcion: "",
            proyecto: "",
            actividad: "",
            lugarEntrega: "",
            solicitante: "",
            cedulaJuridica: "",
            cuentaPresupuestaria: "",
            saldoCuenta: 0,
            items: [],
        });

        // Limpiar estados relacionados a cuentas
        setSaldoDisponible(0);
        setSaldoOriginal(0);
        setDetallePartida(null);

        // Limpiar búsquedas
        setCuentaSearch("");
        setVendorSearch("");
        setActividadSearch("");
        setUnidadSearch("");

        // Cerrar dropdowns
        setShowCuentaDropdown(false);
        setShowVendorDropdown(false);
        setShowActividadDropdown(false);
        setShowUnidadDropdown(false);
    };


    const handleGuardar = async () => {
        try {
            setLoading(true);
            setMensaje(null);

            if (!form.cuentaPresupuestaria) {
                toast.error("❌ Debe seleccionar una cuenta presupuestaria");
                return;
            }
            if (saldoDisponible < 0) {
                toast.error("❌ El total excede el saldo disponible");
                return;
            }

            const payload = {
                orderNumber: form.numeroOrden,
                providerName: form.proveedor,
                description: form.descripcion,
                amount: form.items.reduce((acc, i) => acc + (i.montoTotal || 0), 0),
                status: "Pendiente",
                date: form.fecha || new Date(),
                project: form.proyecto,
                deliveryPlace: form.lugarEntrega,
                requester: form.solicitante,
                juridic: form.cedulaJuridica,
                budgetAccount: form.cuentaPresupuestaria,
                items: form.items,
                licitacion: form.licitacion,
            };

            await createOrder(payload);

            toast.success(`Orden guardada correctamente ✅`);
            await delay(3000);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Error guardando orden:", error);
            toast.error("❌ Error al guardar la orden");
        } finally {
            setLoading(false);
        }
    };

    const handleNewItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddItem(newItem);
        }
    };

    const saldoColor =
        saldoDisponible < 0
            ? "text-red-600"
            : saldoDisponible < saldoOriginal * 0.2
                ? "text-yellow-600"
                : "text-green-600";

    // Cálculos para la tarjeta de cuenta presupuestaria
    const totalPresupuesto = detallePartida ? Number(detallePartida.TOTAL1 || 0) : 0;
    const comprometidoPresupuesto = detallePartida ? Number(detallePartida.COMPROMETI || 0) : 0;
    const disponiblePresupuesto = detallePartida ? Number(detallePartida.DISPONIBLE || 0) : 0;

    // 🔢 Porcentaje de consumo (con decimales)
    const porcentajeUsado =
        detallePartida && totalPresupuesto > 0
            ? (comprometidoPresupuesto / totalPresupuesto) * 100
            : null;

    // Valor que se usa para el ancho de la barra (mínimo 1% si hay algo comprometido)
    const barraConsumo =
        porcentajeUsado === null
            ? 0
            : porcentajeUsado > 0 && porcentajeUsado < 1
                ? 1
                : porcentajeUsado;



    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            className="relative flex flex-col bg-slate-50 w-full max-w-7xl rounded-2xl shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-white sticky top-0 z-10">
                                <h2 className="text-lg font-bold text-[#0d141b]">Nueva Orden de Compra</h2>
                                <button onClick={onClose} className="text-[#0d141b] hover:text-red-500 font-semibold">
                                    ✕
                                </button>
                            </div>

                            {/* ✅ MENSAJE FIJO ARRIBA */}
                            {mensaje && (
                                <div className="px-6 py-2 bg-emerald-50 text-emerald-700 text-center font-medium border-b border-emerald-200">
                                    {mensaje}
                                </div>
                            )}

                            {/* SALDO GLOBAL */}
                            <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-lg font-bold text-gray-700">Saldo Disponible:</span>
                                    </div>
                                    <div className={`text-2xl font-bold ${saldoColor}`}>{formatearColones(saldoDisponible)}</div>
                                </div>
                                {saldoDisponible < 0 && (
                                    <p className="text-red-600 text-sm mt-2 font-medium">
                                        ⚠️ El total de los ítems excede el saldo disponible
                                    </p>
                                )}
                            </div>

                            {/* FORMULARIO */}
                            <div className="p-6 overflow-y-auto max-h-[85vh]">
                                <div className="flex flex-col gap-6 text-[#0d141b]">
                                    {/* LICITACIÓN / NÚMERO */}
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <div className="w-1/3">
                                            <label className="block text-base font-medium pb-2">Licitación</label>
                                            <select
                                                name="licitacion"
                                                value={form.licitacion}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar licitación</option>
                                                {licitaciones.map((l) => (
                                                    <option key={l.tipo} value={l.tipo}>
                                                        {l.tipo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-end justify-end flex-1">
                                            <div className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow text-xl">
                                                No. {form.numeroOrden}
                                            </div>
                                        </div>
                                    </div>

                                    {/* FECHA */}
                                    <div className="w-1/4">
                                        <label className="block text-base font-medium pb-2">Fecha de emisión</label>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={form.fecha}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* PROVEEDOR + CÉDULA */}
                                    <div className="flex gap-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex-1 relative">
                                            <label className="block text-base font-medium pb-2">Proveedor</label>
                                            <div
                                                onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 cursor-pointer flex items-center justify-between"
                                            >
                                                {form.proveedor || "Seleccionar proveedor"}
                                                <span>▼</span>
                                            </div>

                                            {showVendorDropdown && (
                                                <div className="absolute z-50 bg-white border rounded-lg shadow-lg w-full mt-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar proveedor..."
                                                        value={vendorSearch}
                                                        onChange={(e) => setVendorSearch(e.target.value)}
                                                        className="w-full px-3 py-2 border-b outline-none"
                                                    />
                                                    <div className="dropdown-scroll">
                                                        {vendors
                                                            .filter((v) => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                                                            .map((vendor) => (
                                                                <div
                                                                    key={vendor.id}
                                                                    onClick={() => {
                                                                        onProveedorSeleccionado(vendor);
                                                                        setShowVendorDropdown(false);
                                                                    }}
                                                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                                                >
                                                                    <div className="font-medium">{vendor.name}</div>
                                                                    {vendor.activity && <div className="text-xs text-gray-500">{vendor.activity}</div>}
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-1/3">
                                            <label className="block text-base font-medium pb-2">Cédula jurídica</label>
                                            <input
                                                value={form.cedulaJuridica}
                                                readOnly
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-gray-100 p-[13px] h-14 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* ACTIVIDAD (informativo) */}
                                    <div className="flex-1 relative mt-2">
                                        <label className="block text-base font-medium pb-2">Actividad</label>
                                        <div
                                            onClick={() => setShowActividadDropdown(!showActividadDropdown)}
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 cursor-pointer flex items-center justify-between"
                                        >
                                            {form.actividad || "Seleccionar actividad"}
                                            <span>▼</span>
                                        </div>
                                        {showActividadDropdown && (
                                            <div className="absolute z-50 bg-white border rounded-lg shadow-lg w-full mt-1">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar actividad..."
                                                    value={actividadSearch}
                                                    onChange={(e) => setActividadSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border-b outline-none"
                                                />
                                                <div className="dropdown-scroll">
                                                    {vendors
                                                        .map((v) => v.activity)
                                                        .filter(Boolean)
                                                        .filter((act, idx, arr) => arr.indexOf(act!) === idx)
                                                        .filter((act) => act!.toLowerCase().includes(actividadSearch.toLowerCase()))
                                                        .map((act) => (
                                                            <div
                                                                key={act}
                                                                onClick={() => {
                                                                    setForm((prev) => ({ ...prev, actividad: act as string }));
                                                                    setShowActividadDropdown(false);
                                                                }}
                                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                                            >
                                                                {act}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CUENTA PRESUPUESTARIA */}
                                    <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
                                        <label className="block text-base font-medium pb-2">Cuenta presupuestaria</label>

                                        <div
                                            onClick={() => setShowCuentaDropdown(!showCuentaDropdown)}
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 cursor-pointer flex items-center justify-between"
                                        >
                                            {form.cuentaPresupuestaria || "Seleccionar cuenta"}
                                            <span>▼</span>
                                        </div>

                                        {showCuentaDropdown && (
                                            <div className="absolute z-50 bg-white border rounded-lg shadow-lg w-full mt-1">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar por código o descripción..."
                                                    value={cuentaSearch}
                                                    onChange={(e) => setCuentaSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border-b outline-none"
                                                />

                                                <div className="dropdown-scroll">
                                                    {cuentasFiltradasLocal.length === 0 ? (
                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            {cuentaSearch?.trim() ? "Sin resultados para esta búsqueda." : "No hay datos cargados."}
                                                        </div>
                                                    ) : (
                                                        cuentasFiltradasLocal.map((c) => (
                                                            <div
                                                                key={c.CUENTA}
                                                                onClick={() => {
                                                                    aplicarCuentaYSaldo(c.CUENTA);
                                                                    setShowCuentaDropdown(false);
                                                                }}
                                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                                            >
                                                                <div className="font-medium">{c.CUENTA}</div>
                                                                <div className="text-xs text-gray-500">{c.DESCRI1}</div>

                                                                <div className="text-xs text-emerald-700">
                                                                    Presupuesto inicial: {formatearColones(Number(c.TOTAL1 || 0))}
                                                                </div>
                                                                <div className="text-xs text-orange-600">
                                                                    Comprometido: {formatearColones(Number(c.COMPROMETI || 0))}
                                                                </div>
                                                                <div className="text-xs text-indigo-600 font-semibold">
                                                                    Presupuesto disponible: {formatearColones(Number(c.DISPONIBLE || 0))}
                                                                </div>
                                                            </div>

                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {form.cuentaPresupuestaria && (
                                            <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium">
                                                Cuenta {form.cuentaPresupuestaria} — Disponible: {formatearColones(disponiblePresupuesto)}
                                            </div>
                                        )}

                                        {/* 🔹 Resumen numérico */}
                                        <div className="mt-3 text-sm font-medium space-y-1">
                                            <p className="text-blue-700">
                                                Saldo inicial:{" "}
                                                <span className="font-bold">{formatearColones(totalPresupuesto)}</span>
                                            </p>
                                            <p className="text-orange-700">
                                                Comprometido:{" "}
                                                <span className="font-bold">{formatearColones(comprometidoPresupuesto)}</span>
                                            </p>
                                            <p className="text-green-700">
                                                Disponible:{" "}
                                                <span className="font-bold">{formatearColones(disponiblePresupuesto)}</span>
                                            </p>
                                        </div>

                                        {/* Barra visual de consumo */}
                                        {porcentajeUsado !== null && (
                                            <div className="mt-3">
                                                <div className="text-xs mb-1 font-semibold text-slate-600">
                                                    Consumo presupuestario: {porcentajeUsado.toFixed(2)}%
                                                </div>

                                                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                                    <div
                                                        className={`
                    h-full rounded-full transition-all duration-500
                    ${barraConsumo < 50
                                                                ? "bg-green-500"
                                                                : barraConsumo < 80
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-600"
                                                            }
                `}
                                                        style={{ width: `${barraConsumo}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}




                                    </div>

                                    {/* CONCEPTO */}
                                    <div>
                                        <label className="block text-base font-medium pb-2">Concepto</label>
                                        <textarea
                                            name="descripcion"
                                            value={form.descripcion}
                                            onChange={handleChange}
                                            placeholder="Describa el propósito de la orden"
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] min-h-32 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* PROYECTO + SOLICITANTE */}
                                    <div className="flex gap-6">
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Proyecto</label>
                                            <select
                                                name="proyecto"
                                                value={form.proyecto}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar proyecto</option>
                                                {proyectos.map((proyecto) => (
                                                    <option key={proyecto.id} value={proyecto.nombre}>
                                                        {proyecto.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* SOLICITANTE - ahora input escrito */}
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Solicitante</label>
                                            <input
                                                name="solicitante"
                                                value={form.solicitante}
                                                onChange={(e) => setForm(prev => ({ ...prev, solicitante: e.target.value }))}
                                                placeholder="Escriba el nombre del solicitante"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* LUGAR DE ENTREGA */}
                                    <div className="mt-2">
                                        <label className="block text-base font-medium pb-2">Lugar de entrega</label>
                                        <input
                                            name="lugarEntrega"
                                            value={form.lugarEntrega}
                                            onChange={handleChange}
                                            placeholder="Dirección de entrega"
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[13px] h-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* ÍTEMS */}
                                <div className="mt-8 pt-4 border-t border-slate-200">
                                    <h3 className="text-[20px] font-bold pb-3">Ítems</h3>

                                    {/* 🔹 Sección de agregar ítem con labels por campo */}
                                    <div className="grid grid-cols-6 gap-4 bg-white p-4 rounded-lg border border-slate-200">
                                        {/* Cantidad */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-600">Cantidad</label>
                                            <input
                                                name="cantidad"
                                                type="number"
                                                placeholder="Ej: 10"
                                                value={newItem.cantidad}
                                                onChange={handleNewItemChange}
                                                className="border rounded p-2 h-10"
                                            />
                                        </div>

                                        {/* Unidad */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-600">Unidad</label>
                                            <div className="relative">
                                                <div
                                                    onClick={() => setShowUnidadDropdown(!showUnidadDropdown)}
                                                    className="border rounded p-2 cursor-pointer bg-white h-10 flex items-center justify-between"
                                                >
                                                    {newItem.unidad || "Seleccionar unidad"}
                                                    <span>▼</span>
                                                </div>

                                                {showUnidadDropdown && (
                                                    <div className="absolute z-50 bg-white border rounded-lg shadow-lg w-full mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Buscar unidad..."
                                                            value={unidadSearch}
                                                            onChange={(e) => setUnidadSearch(e.target.value)}
                                                            className="w-full px-2 py-1 border-b outline-none"
                                                        />
                                                        <div className="dropdown-scroll">
                                                            {unidadesMedida
                                                                .filter((u) => u.toLowerCase().includes(unidadSearch.toLowerCase()))
                                                                .map((unidad) => (
                                                                    <div
                                                                        key={unidad}
                                                                        onClick={() => {
                                                                            setNewItem((prev) => ({ ...prev, unidad }));
                                                                            setShowUnidadDropdown(false);
                                                                        }}
                                                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                                                    >
                                                                        {unidad}
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Detalle */}
                                        <div className="flex flex-col gap-1 col-span-2">
                                            <label className="text-xs font-semibold text-slate-600">Detalle</label>
                                            <input
                                                name="detalle"
                                                placeholder="Detalle del bien o servicio"
                                                value={newItem.detalle}
                                                onChange={handleNewItemChange}
                                                className="border rounded p-2 h-10"
                                            />
                                        </div>

                                        {/* Cuenta (EDITABLE) */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-600">Cuenta</label>
                                            <input
                                                name="cuenta"
                                                value={newItem.cuenta || form.cuentaPresupuestaria}  // autollenado editable
                                                onChange={(e) =>
                                                    setNewItem(prev => ({ ...prev, cuenta: e.target.value })) // permite modificar libremente
                                                }
                                                placeholder="Cuenta contable"
                                                className="border rounded p-2 h-10"
                                            />
                                        </div>

                                        {/* Nombre */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-600">Nombre</label>
                                            <input
                                                name="nombre"
                                                placeholder="Nombre corto"
                                                value={newItem.nombre}
                                                onChange={handleNewItemChange}
                                                className="border rounded p-2 h-10"
                                            />
                                        </div>

                                        {/* Costo unitario */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-600">Costo unitario</label>
                                            <input
                                                name="costoUnitario"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={newItem.costoUnitario}
                                                onChange={handleNewItemChange}
                                                onKeyDown={handleNewItemKeyDown}
                                                className="border rounded p-2 h-10"
                                            />
                                        </div>

                                        <div className="col-span-6 flex justify-end mt-2">
                                            <button
                                                onClick={() => handleAddItem(newItem)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                                            >
                                                ➕ Agregar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabla de ítems ya agregados */}
                                    <div className="overflow-x-auto rounded-lg border border-[#cfdbe7] mt-4">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    {[
                                                        "Cantidad",
                                                        "Unidad",
                                                        "Detalle",
                                                        "Cuenta",
                                                        "Nombre",
                                                        "Costo unitario",
                                                        "Monto total",
                                                        "",
                                                    ].map((h) => (
                                                        <th key={h} className="px-4 py-3 text-left font-medium text-[#0d141b]">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {form.items.map((item, idx) => (
                                                    <tr key={idx} className="border-t border-[#cfdbe7]">
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="number"
                                                                value={item.cantidad}
                                                                onChange={(e) => handleItemChange(idx, "cantidad", Number(e.target.value))}
                                                                className="w-20 border rounded-md p-1 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2">
                                                            <input
                                                                value={item.unidad}
                                                                onChange={(e) => handleItemChange(idx, "unidad", e.target.value)}
                                                                className="w-28 border rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2">
                                                            <textarea
                                                                value={item.detalle}
                                                                onChange={(e) => handleItemChange(idx, "detalle", e.target.value)}
                                                                className="w-60 border rounded-md p-1 min-h-[60px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                placeholder="Descripción detallada del ítem"
                                                            />
                                                        </td>

                                                        {/* 🟢 Cuenta editable en la tabla */}
                                                        <td className="px-4 py-2">
                                                            <input
                                                                value={item.cuenta}
                                                                onChange={(e) => handleItemChange(idx, "cuenta", e.target.value)}
                                                                className="w-36 border rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2">
                                                            <input
                                                                value={item.nombre}
                                                                onChange={(e) => handleItemChange(idx, "nombre", e.target.value)}
                                                                className="w-40 border rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={item.costoUnitario}
                                                                onChange={(e) => handleItemChange(idx, "costoUnitario", Number(e.target.value))}
                                                                className="w-28 border rounded-md p-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2 text-right text-[#4c739a] font-semibold">
                                                            {formatearColones(item.montoTotal)}
                                                        </td>

                                                        <td className="px-2 text-center">
                                                            <button
                                                                onClick={() => handleRemoveItem(idx)}
                                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* BOTÓN GUARDAR */}
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleGuardar}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition disabled:bg-gray-400"
                                    >
                                        {loading ? "Guardando..." : "Guardar Orden"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrdenDeCompraModal;

/* Estilos del scroll de dropdown (mantenidos locales por simplicidad) */
<style>
    {`
  .dropdown-scroll {
    max-height: 240px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cdd6e0 #f1f5f9;
  }
  .dropdown-scroll::-webkit-scrollbar { width: 6px; }
  .dropdown-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
  .dropdown-scroll::-webkit-scrollbar-thumb { background-color: #cdd6e0; border-radius: 20px; }
`}
</style>
