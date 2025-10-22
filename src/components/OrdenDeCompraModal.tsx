import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { crearOrdenDeCompra } from "@/firebase/ordenesDeCompra";
import { proveedores, licitaciones, proyectos, generarSaldoAleatorio, formatearColones } from "@/data/staticData";

interface OrdenDeCompraModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrdenDeCompraModal: React.FC<OrdenDeCompraModalProps> = ({ isOpen, onClose }) => {
    const [saldoDisponible, setSaldoDisponible] = useState<number>(0);
    const [saldoOriginal, setSaldoOriginal] = useState<number>(0);
    const [form, setForm] = useState({
        licitacion: "",
        fecha: "",
        numeroOrden: "",
        proveedor: "",
        descripcion: "",
        proyecto: "",
        lugarEntrega: "",
        solicitante: "",
        cedulaJuridica: "",
        items: [
            {
                cantidad: 0,
                unidad: "",
                detalle: "",
                cuenta: "",
                nombre: "",
                costoUnitario: 0,
                montoTotal: 0,
            },
        ],
    });

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);

    // Generar saldo aleatorio al abrir el modal
    useEffect(() => {
        if (isOpen) {
            const nuevoSaldo = generarSaldoAleatorio();
            setSaldoDisponible(nuevoSaldo);
            setSaldoOriginal(nuevoSaldo);
            
            // Generar número de orden automático
            const numeroOrden = `ORD-${Date.now().toString().slice(-6)}`;
            setForm(prev => ({ ...prev, numeroOrden }));
        }
    }, [isOpen]);

    // Recalcular saldo disponible cuando cambien los items
    useEffect(() => {
        const totalGastado = form.items.reduce((total, item) => total + (item.montoTotal || 0), 0);
        setSaldoDisponible(saldoOriginal - totalGastado);
    }, [form.items, saldoOriginal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Si es proveedor, auto-llenar cédula jurídica
        if (name === "proveedor") {
            const proveedorSeleccionado = proveedores.find(p => p.nombre === value);
            setForm(prev => ({
                ...prev,
                [name]: value,
                cedulaJuridica: proveedorSeleccionado?.cedulaJuridica || ""
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        setForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            };

            // Recalcular monto total automático
            if (field === "cantidad" || field === "costoUnitario") {
                const nuevoMontoTotal = Number(updatedItems[index].cantidad) * Number(updatedItems[index].costoUnitario || 0);
                
                // Verificar si excede el saldo disponible
                const totalOtrosItems = updatedItems.reduce((total, item, idx) => {
                    if (idx === index) return total;
                    return total + (item.montoTotal || 0);
                }, 0);
                
                const saldoRestante = saldoOriginal - totalOtrosItems;
                
                if (nuevoMontoTotal > saldoRestante) {
                    // No permitir que exceda el saldo
                    setMensaje("⚠️ No se puede agregar este ítem. Excede el saldo disponible.");
                    setTimeout(() => setMensaje(null), 3000);
                    return prev; // No actualizar si excede el saldo
                }
                
                updatedItems[index].montoTotal = nuevoMontoTotal;
            }

            return { ...prev, items: updatedItems };
        });
    };

    const handleAddItem = () => {
        const nuevoItem = {
            cantidad: 0,
            unidad: "",
            detalle: "",
            cuenta: "",
            nombre: "",
            costoUnitario: 0,
            montoTotal: 0,
        };

        setForm(prev => ({
            ...prev,
            items: [...prev.items, nuevoItem],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleGuardar = async () => {
        try {
            setLoading(true);
            setMensaje(null);

            // Validar que no exceda el saldo
            if (saldoDisponible < 0) {
                setMensaje("❌ No se puede guardar. El total excede el saldo disponible.");
                return;
            }

            await crearOrdenDeCompra(form);
            setMensaje("✅ Orden guardada correctamente");
            
            // Limpiar el formulario
            setForm({
                licitacion: "",
                fecha: "",
                numeroOrden: `ORD-${Date.now().toString().slice(-6)}`,
                proveedor: "",
                descripcion: "",
                proyecto: "",
                lugarEntrega: "",
                solicitante: "",
                cedulaJuridica: "",
                items: [
                    {
                        cantidad: 0,
                        unidad: "",
                        detalle: "",
                        cuenta: "",
                        nombre: "",
                        costoUnitario: 0,
                        montoTotal: 0,
                    },
                ],
            });
            
            // Generar nuevo saldo
            const nuevoSaldo = generarSaldoAleatorio();
            setSaldoDisponible(nuevoSaldo);
            setSaldoOriginal(nuevoSaldo);
            
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error('Error guardando orden:', error);
            setMensaje("❌ Error al guardar la orden");
        } finally {
            setLoading(false);
        }
    };

    const saldoColor = saldoDisponible < 0 ? "text-red-600" : saldoDisponible < saldoOriginal * 0.2 ? "text-yellow-600" : "text-green-600";

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
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-white sticky top-0 z-10">
                                <h2 className="text-lg font-bold text-[#0d141b]">Nueva Orden de Compra</h2>
                                <button
                                    onClick={onClose}
                                    className="text-[#0d141b] hover:text-red-500 font-semibold"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Saldo Disponible - Campo destacado */}
                            <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-lg font-bold text-gray-700">Saldo Disponible:</span>
                                    </div>
                                    <div className={`text-2xl font-bold ${saldoColor}`}>
                                        {formatearColones(saldoDisponible)}
                                    </div>
                                </div>
                                {saldoDisponible < 0 && (
                                    <p className="text-red-600 text-sm mt-2 font-medium">
                                        ⚠️ El total de los ítems excede el saldo disponible
                                    </p>
                                )}
                            </div>

                            {/* Contenido */}
                            <div className="p-6 overflow-y-auto max-h-[85vh]">
                                <div className="flex flex-col gap-6 text-[#0d141b]">
                                    {/* Licitación */}
                                    <div>
                                        <label className="block text-base font-medium pb-2">Licitación</label>
                                        <select
                                            name="licitacion"
                                            value={form.licitacion}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar licitación</option>
                                            {licitaciones.map(licitacion => (
                                                <option key={licitacion.id} value={licitacion.codigo}>
                                                    {licitacion.codigo} - {licitacion.descripcion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fecha + Número de orden */}
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Fecha de la orden</label>
                                            <input
                                                type="date"
                                                name="fecha"
                                                value={form.fecha}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Número de orden</label>
                                            <input
                                                name="numeroOrden"
                                                value={form.numeroOrden}
                                                onChange={handleChange}
                                                placeholder="ORD-001"
                                                readOnly
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-gray-100 p-[15px] h-14 text-base focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Proveedor */}
                                    <div>
                                        <label className="block text-base font-medium pb-2">Seleccionar proveedor</label>
                                        <select
                                            name="proveedor"
                                            value={form.proveedor}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar proveedor</option>
                                            {proveedores.map(proveedor => (
                                                <option key={proveedor.id} value={proveedor.nombre}>
                                                    {proveedor.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-base font-medium pb-2">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={form.descripcion}
                                            onChange={handleChange}
                                            placeholder="Ingrese la descripción de la orden"
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] min-h-36 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        ></textarea>
                                    </div>

                                    {/* Proyecto + Lugar */}
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Proyecto</label>
                                            <select
                                                name="proyecto"
                                                value={form.proyecto}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar proyecto</option>
                                                {proyectos.map(proyecto => (
                                                    <option key={proyecto.id} value={proyecto.nombre}>
                                                        {proyecto.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Lugar de entrega</label>
                                            <input
                                                name="lugarEntrega"
                                                value={form.lugarEntrega}
                                                onChange={handleChange}
                                                placeholder="Dirección de entrega"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Solicitante + Cédula */}
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Solicitante</label>
                                            <input
                                                name="solicitante"
                                                value={form.solicitante}
                                                onChange={handleChange}
                                                placeholder="Nombre del solicitante"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Cédula jurídica del proveedor</label>
                                            <input
                                                name="cedulaJuridica"
                                                value={form.cedulaJuridica}
                                                onChange={handleChange}
                                                placeholder="Se llena automáticamente"
                                                readOnly
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-gray-100 p-[15px] h-14 text-base focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Tabla de Items */}
                                    <div>
                                        <h3 className="text-[20px] font-bold pb-3">Items</h3>

                                        <div className="overflow-x-auto rounded-lg border border-[#cfdbe7]">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-100">
                                                    <tr>
                                                        {["Cantidad", "Unidad", "Detalle", "Cuenta", "Nombre", "Costo unitario", "Monto total", ""].map((h) => (
                                                            <th key={h} className="px-4 py-3 text-left font-medium text-[#0d141b]">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {form.items.map((item, idx) => (
                                                        <tr key={idx} className="border-t border-[#cfdbe7]">
                                                            {/* Cantidad */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={item.cantidad}
                                                                    onChange={(e) => handleItemChange(idx, "cantidad", Number(e.target.value))}
                                                                    className="w-20 border rounded-md p-1 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                            </td>

                                                            {/* Unidad */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.unidad}
                                                                    onChange={(e) => handleItemChange(idx, "unidad", e.target.value)}
                                                                    className="w-28 border rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                            </td>

                                                            {/* Detalle - Campo más largo */}
                                                            <td className="px-4 py-2">
                                                                <textarea
                                                                    value={item.detalle}
                                                                    onChange={(e) => handleItemChange(idx, "detalle", e.target.value)}
                                                                    className="w-60 border rounded-md p-1 min-h-[60px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                    placeholder="Descripción detallada del ítem"
                                                                />
                                                            </td>

                                                            {/* Cuenta */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.cuenta}
                                                                    onChange={(e) => handleItemChange(idx, "cuenta", e.target.value)}
                                                                    className="w-28 border rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                            </td>

                                                            {/* Nombre */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.nombre}
                                                                    onChange={(e) => handleItemChange(idx, "nombre", e.target.value)}
                                                                    className="w-40 border rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                            </td>

                                                            {/* Costo Unitario */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.costoUnitario}
                                                                    onChange={(e) => handleItemChange(idx, "costoUnitario", Number(e.target.value))}
                                                                    className="w-28 border rounded-md p-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                            </td>

                                                            {/* Monto Total */}
                                                            <td className="px-4 py-2 text-right text-[#4c739a] font-semibold">
                                                                {formatearColones(item.montoTotal)}
                                                            </td>

                                                            {/* Eliminar */}
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

                                        {/* Botón Agregar Item */}
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                onClick={handleAddItem}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                                            >
                                                ➕ Agregar Ítem
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mensaje de estado */}
                                    {mensaje && (
                                        <div className="text-center font-medium mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                            {mensaje}
                                        </div>
                                    )}

                                    {/* Botones */}
                                    <div className="flex flex-wrap justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleGuardar}
                                            disabled={loading || saldoDisponible < 0}
                                            className="bg-[#1380ec] text-white px-6 h-12 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0f6bc7] transition"
                                        >
                                            {loading ? "Guardando..." : "Guardar Orden"}
                                        </button>
                                    </div>
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