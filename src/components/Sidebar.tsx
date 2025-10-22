import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Package,
    DollarSign,
    Users,
    FileText,
    CreditCard,
    BarChart,
    Archive,
    FileText as ReportIcon,
    LogOut
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import type { RootState } from "@/store/store";
import logo from "@/assets/images/logo-oreamuno.png";

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { logout } = useAuth();

    const menuItems = [
        {
            path: "/",
            name: "Dashboard",
            icon: Home,
        },
        {
            path: "/proveeduria",
            name: "Proveeduría",
            icon: Package,
        },
        {
            path: "/finanzas",
            name: "Finanzas",
            icon: DollarSign,
        },
        {
            path: "/recursos-humanos",
            name: "Recursos Humanos",
            icon: Users,
        },
        {
            path: "/presupuesto",
            name: "Presupuesto",
            icon: FileText,
        },
        {
            path: "/tesoreria",
            name: "Tesorería",
            icon: CreditCard,
        },
        {
            path: "/contabilidad",
            name: "Contabilidad",
            icon: BarChart,
        },
        {
            path: "/inventarios",
            name: "Inventarios",
            icon: Archive,
        },
        {
            path: "/reportes",
            name: "Reportes",
            icon: ReportIcon,
        }
    ];

    const handleLogout = () => {
        if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
            logout();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-[#cfdbe7] w-64">
            {/* Logo y título */}
            <div className="flex items-center gap-3 p-6 border-b border-[#cfdbe7]">
                <img
                    src={logo}
                    alt="Logo Municipalidad"
                    className="h-10 w-10 object-contain"
                />
                <div>
                    <h1 className="text-lg font-bold text-[#0d141b]">
                        Municipalidad CR
                    </h1>
                    <p className="text-sm text-[#4c739a]">
                        Panel de Administración
                    </p>
                </div>
            </div>

            {/* Información del usuario */}
            <div className="p-4 border-b border-[#cfdbe7] bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0d141b] truncate">
                            {user?.email || 'Usuario'}
                        </p>
                        <p className="text-xs text-[#4c739a]">
                            Administrador
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-[#1380ec] text-white"
                                            : "text-[#4c739a] hover:bg-slate-100 hover:text-[#0d141b]"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Botón de logout */}
            <div className="p-4 border-t border-[#cfdbe7]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>

            {/* Información de desarrollo */}
            <div className="p-4 border-t border-[#cfdbe7] bg-blue-50">
                <div className="text-xs text-blue-600">
                    <p className="font-semibold">Modo Desarrollo</p>
                    <p>Base de datos: MySQL</p>
                    <p>Estado: Conectado</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;