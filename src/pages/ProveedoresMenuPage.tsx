import React from "react";
import { useNavigate } from "react-router-dom";

const ProveedoresMenuPage: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 1, title: "Entradas x Compra", icon: "📦", route: "/entradas-compra" },
        { id: 2, title: "Entradas x Ajustes", icon: "📝", route: "/entradas-ajustes" },
        { id: 3, title: "Salidas x Ajustes", icon: "📤", route: "/salidas-ajustes" },
        { id: 4, title: "Salidas x Requisición", icon: "📋", route: "/salidas-requisicion" },
        { id: 5, title: "Buscar Órdenes", icon: "🔍", route: "/buscar-ordenes" },
        { id: 6, title: "Órdenes de Compra", icon: "🛒", route: "/proveeduria" },
        { id: 7, title: "Compromisos", icon: "🤝", route: "/compromisos" },
        { id: 8, title: "Reservas", icon: "📅", route: "/reservas" },
        { id: 9, title: "Consultar Cheques", icon: "💰", route: "/consultar-cheques" },
        { id: 10, title: "Consultar Órdenes", icon: "📊", route: "/consultar-ordenes" },
        { id: 11, title: "Consultar Transferencias", icon: "💸", route: "/consultar-transferencias" },
        { id: 12, title: "Proveedores", icon: "🏢", route: "/gestionar-proveedores" },
        { id: 13, title: "Nómina de Pago", icon: "💵", route: "/nomina-pago" },
        { id: 14, title: "Familias", icon: "👥", route: "/familias" },
        { id: 15, title: "Artículos", icon: "📦", route: "/articulos" },
        { id: 16, title: "Costos", icon: "💲", route: "/costos" },
        { id: 17, title: "Saldos Actuales", icon: "📈", route: "/saldos-actuales" }
    ];

    const handleMenuClick = (route: string) => {
        navigate(route);
    };

    return (
        <div className="flex flex-col w-full bg-slate-50 text-[#0d141b]">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-3 p-6 border-b border-[#cfdbe7] bg-white">
                <h1 className="text-[32px] font-bold leading-tight tracking-[-0.015em]">
                    Menú de Proveedores
                </h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg border border-[#cfdbe7] px-4 py-2 text-sm font-medium hover:bg-[#f1f5f9] transition"
                >
                    ← Volver al Dashboard
                </button>
            </div>

            {/* GRID DE OPCIONES */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleMenuClick(item.route)}
                            className="bg-white rounded-lg border border-[#cfdbe7] p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="text-3xl group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-[#0d141b] group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INFORMACIÓN */}
            <div className="px-6 pb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 text-sm">
                        <strong>Nota:</strong> Seleccione una opción del menú para acceder a las diferentes funcionalidades del módulo de proveedores.
                        Las opciones marcadas como "Órdenes de Compra" lo llevarán al sistema actual de gestión de órdenes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProveedoresMenuPage;