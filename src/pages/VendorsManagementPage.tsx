import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getVendors,
    updateVendor,
    createVendor,
} from "@/api/vendors";

const VendorsManagementPage: React.FC = () => {
    const navigate = useNavigate();

    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // MODALS
    const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // FORM CREATE
    const [newVendor, setNewVendor] = useState({
        name: "",
        representative: "",
        phone: "",
        email: "",
        activity: "",
    });

    const limit = 12;

    // Fetch principal
    const fetchVendorsData = async () => {
        try {
            setLoading(true);
            const res = await getVendors(page, limit, search);

            setVendors(res.data);
            setTotalPages(res.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendorsData();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchVendorsData();
    };

    // Save EDITS
    const handleSave = async () => {
        try {
            await updateVendor(selectedVendor.id, selectedVendor);
            fetchVendorsData();
            setIsEditing(false);
            alert("Proveedor actualizado ✅");
        } catch (error) {
            alert("Error al actualizar");
        }
    };

    // CREATE vendor
    const handleCreate = async () => {
        try {
            await createVendor(newVendor);

            fetchVendorsData();
            setShowCreateModal(false);

            setNewVendor({ name: "", representative: "", phone: "", email: "", activity: "" });

            alert("Proveedor creado ✅");
        } catch (error) {
            alert("Error al crear proveedor");
        }
    };

    return (
        <div className="flex flex-col w-full bg-slate-50 text-[#0d141b]">

            {/* HEADER */}
            <div className="flex justify-between items-center p-6 border-b bg-white">
                <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
                <button
                    onClick={() => navigate("/proveedores-menu")}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-[#f1f5f9]"
                >
                    ← Volver al menú
                </button>
            </div>

            {/* FILTROS Y NUEVO */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-b">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        className="px-3 py-2 border rounded-lg text-sm w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={handleSearch}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-[#f1f5f9] transition"
                    >
                        Filtrar
                    </button>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Nuevo Proveedor
                </button>
            </div>

            {/* LIST */}
            <div className="p-6">
                {loading ? (
                    <p className="text-center text-gray-500">Cargando...</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {vendors.map((v) => (
                                <div
                                    key={v.id}
                                    className="bg-white rounded-lg border p-5 hover:shadow-md transition"
                                >
                                    <h3 className="text-lg font-bold text-blue-700">{v.name}</h3>
                                    <p className="text-sm text-gray-600">{v.representative}</p>
                                    <p className="text-sm text-gray-500">{v.phone}</p>
                                    <p className="text-sm text-gray-500 truncate">{v.email}</p>

                                    <button
                                        onClick={() => {
                                            setSelectedVendor({ ...v });
                                            setIsEditing(false);
                                        }}
                                        className="text-blue-600 text-sm mt-2 hover:underline"
                                    >
                                        Ver detalles →
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-center gap-3 mt-6">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-2 border">
                                ←
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-2 border ${page === i + 1 ? "bg-blue-600 text-white" : ""}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-2 border">
                                →
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL DETALLE */}
            {selectedVendor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                        <button className="absolute right-4 top-4" onClick={() => setSelectedVendor(null)}>✕</button>

                        {!isEditing ? (
                            <>
                                <h2 className="text-xl font-bold mb-4">{selectedVendor.name}</h2>
                                <p><strong>Representante:</strong> {selectedVendor.representative}</p>
                                <p><strong>Teléfono:</strong> {selectedVendor.phone}</p>
                                <p><strong>Correo:</strong> {selectedVendor.email}</p>
                                <p><strong>Actividad:</strong> {selectedVendor.activity}</p>

                                <button
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Editar
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold mb-4">Editar proveedor</h2>

                                <input className="border p-2 w-full rounded mb-2"
                                    value={selectedVendor.name}
                                    onChange={(e) => setSelectedVendor({ ...selectedVendor, name: e.target.value })}
                                />

                                <input className="border p-2 w-full rounded mb-2"
                                    value={selectedVendor.phone}
                                    onChange={(e) => setSelectedVendor({ ...selectedVendor, phone: e.target.value })}
                                />

                                <input className="border p-2 w-full rounded mb-2"
                                    value={selectedVendor.email}
                                    onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                                />

                                <div className="flex justify-between mt-4">
                                    <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setIsEditing(false)}>Cancelar</button>
                                    <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave}>Guardar</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL CREACIÓN */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                        <button className="absolute right-4 top-4" onClick={() => setShowCreateModal(false)}>✕</button>

                        <h2 className="text-xl font-bold mb-4">Nuevo proveedor</h2>

                        {[
                            { label: "Nombre", key: "name" },
                            { label: "Representante", key: "representative" },
                            { label: "Teléfono", key: "phone" },
                            { label: "Correo electrónico", key: "email" },
                            { label: "Actividad", key: "activity" },
                        ].map(({ label, key }) => (
                            <input
                                key={key}
                                className="border p-2 w-full rounded mb-2"
                                placeholder={label}
                                value={newVendor[key as keyof typeof newVendor]}
                                onChange={(e) =>
                                    setNewVendor({ ...newVendor, [key]: e.target.value })
                                }
                            />
                        ))}

                        <div className="flex justify-end mt-4">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreate}>
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VendorsManagementPage;
