// src/components/Sidebar.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import {
    LayoutDashboard,
    Truck,
    DollarSign,
    Users,
    BarChart3,
    Landmark,
    BookOpen,
    Package,
    FileText,
    LogOut
} from "lucide-react";

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${isActive ? "bg-[#e7edf3] text-[#1380ec]" : "text-[#0d141b] hover:text-[#1380ec] hover:bg-[#f1f5f9]"}`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <p className="text-sm font-medium leading-normal">{label}</p>
        </Link>
    );
};

const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <aside className="flex flex-col justify-between w-80 h-screen bg-slate-50 p-4">
            {/* Branding */}
            <div className="flex flex-col mb-4">
                <h1 className="text-[#0d141b] text-base font-medium">Municipalidad CR</h1>
                <p className="text-[#4c739a] text-sm font-normal">Panel de Administración</p>
            </div>

            {/* Menú scrollable */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                <SidebarItem label="Dashboard" icon={<LayoutDashboard size={20} />} to="/dashboard" />
                <SidebarItem label="Proveeduría" icon={<Truck size={20} />} to="/proveeduria" />
                <SidebarItem label="Finanzas" icon={<DollarSign size={20} />} to="/finanzas" />
                <SidebarItem label="Recursos Humanos" icon={<Users size={20} />} to="/rrhh" />
                <SidebarItem label="Presupuesto" icon={<BarChart3 size={20} />} to="/presupuesto" />
                <SidebarItem label="Tesorería" icon={<Landmark size={20} />} to="/tesoreria" />
                <SidebarItem label="Contabilidad" icon={<BookOpen size={20} />} to="/contabilidad" />
                <SidebarItem label="Inventarios" icon={<Package size={20} />} to="/inventarios" />
                <SidebarItem label="Reportes" icon={<FileText size={20} />} to="/reportes" />
            </div>

            {/* Footer fijo abajo */}
            <div className="pt-4 border-t border-slate-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
