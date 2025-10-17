import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { crearOrdenDeCompra } from "@/services/ordenesDeCompraService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface OrdenDeCompraModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrdenDeCompraModal: React.FC<OrdenDeCompraModalProps> = ({ isOpen, onClose }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    
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
                cantidad: 10,
                unidad: "Unidades",
                detalle: "Material de oficina",
                cuenta: "12345",
                nombre: "Papel bond",
                costoUnitario: 5.0,
                montoTotal: 50.0,
            },
        ],
    });

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        setForm((prev) => {
            const updatedItems = [...prev.items];
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            };

            // Recalcular monto total automático
            updatedItems[index].montoTotal =
                Number(updatedItems[index].cantidad) * Number(updatedItems[index].costoUnitario || 0);

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

        setForm((prev) => ({
            ...prev,
            items: [...prev.items, nuevoItem],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleGuardar = async () => {
        if (!user) {
            setMensaje("❌ Error: Usuario no autenticado");
            return;
        }

        try {
            setLoading(true);
            setMensaje(null);
            
            await crearOrdenDeCompra(user.uid, form);
            setMensaje("✅ Orden guardada correctamente");
            
            // Limpiar el formulario
            setForm({
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
            
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error('Error guardando orden:', error);
            setMensaje("❌ Error al guardar la orden");
        } finally {
            setLoading(false);
        }
    };

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
                                <h2 className="text-lg font-bold text-[#0d141b]">Órdenes de Compra</h2>
                                <button
                                    onClick={onClose}
                                    className="text-[#0d141b] hover:text-red-500 font-semibold"
                                >
                                    ✕
                                </button>
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
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
                                        >
                                            <option value="">Seleccionar licitación</option>
                                            <option value="Licitacion 1">Licitacion 1</option>
                                            <option value="Licitacion 2">Licitacion 2</option>
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
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Número de orden</label>
                                            <input
                                                name="numeroOrden"
                                                value={form.numeroOrden}
                                                onChange={handleChange}
                                                placeholder=""
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
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
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
                                        >
                                            <option value="">Seleccionar proveedor</option>
                                            <option value="Proveedor 1">Proveedor 1</option>
                                            <option value="Proveedor 2">Proveedor 2</option>
                                        </select>
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-base font-medium pb-2">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={form.descripcion}
                                            onChange={handleChange}
                                            placeholder="Ingrese la descripción"
                                            className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] min-h-36 text-base focus:outline-none"
                                        ></textarea>
                                    </div>

                                    {/* Proyecto + Lugar */}
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Proyecto</label>
                                            <input
                                                name="proyecto"
                                                value={form.proyecto}
                                                onChange={handleChange}
                                                placeholder="Seleccionar proyecto"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Lugar de entrega</label>
                                            <input
                                                name="lugarEntrega"
                                                value={form.lugarEntrega}
                                                onChange={handleChange}
                                                placeholder="Ingrese el lugar de entrega"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
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
                                                placeholder="Ingrese el solicitante"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-base font-medium pb-2">Cédula jurídica del proveedor</label>
                                            <input
                                                name="cedulaJuridica"
                                                value={form.cedulaJuridica}
                                                onChange={handleChange}
                                                placeholder="Ingrese la cédula jurídica"
                                                className="w-full rounded-lg border border-[#cfdbe7] bg-slate-50 p-[15px] h-14 text-base focus:outline-none"
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
                                                                    className="w-20 border rounded-md p-1 text-center"
                                                                />
                                                            </td>

                                                            {/* Unidad */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.unidad}
                                                                    onChange={(e) => handleItemChange(idx, "unidad", e.target.value)}
                                                                    className="w-28 border rounded-md p-1"
                                                                />
                                                            </td>

                                                            {/* Detalle */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.detalle}
                                                                    onChange={(e) => handleItemChange(idx, "detalle", e.target.value)}
                                                                    className="w-40 border rounded-md p-1"
                                                                />
                                                            </td>

                                                            {/* Cuenta */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.cuenta}
                                                                    onChange={(e) => handleItemChange(idx, "cuenta", e.target.value)}
                                                                    className="w-28 border rounded-md p-1"
                                                                />
                                                            </td>

                                                            {/* Nombre */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    value={item.nombre}
                                                                    onChange={(e) => handleItemChange(idx, "nombre", e.target.value)}
                                                                    className="w-40 border rounded-md p-1"
                                                                />
                                                            </td>

                                                            {/* Costo Unitario */}
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={item.costoUnitario}
                                                                    onChange={(e) => handleItemChange(idx, "costoUnitario", Number(e.target.value))}
                                                                    className="w-28 border rounded-md p-1 text-right"
                                                                />
                                                            </td>

                                                            {/* Monto Total */}
                                                            <td className="px-4 py-2 text-right text-[#4c739a] font-semibold">
                                                                {item.montoTotal.toFixed(2)}
                                                            </td>

                                                            {/* Eliminar */}
                                                            <td className="px-2 text-center">
                                                                <button
                                                                    onClick={() => handleRemoveItem(idx)}
                                                                    className="text-red-500 hover:text-red-700"
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
                                        <p className="text-center font-medium mt-4">
                                            {mensaje}
                                        </p>
                                    )}

                                    {/* Botones */}
                                    <div className="flex flex-wrap justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleGuardar}
                                            disabled={loading || !user}
                                            className="bg-[#1380ec] text-white px-4 h-10 rounded-lg font-bold disabled:opacity-50"
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