// src/layouts/DashboardLayout.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
    return (
        <div
            className="flex min-h-screen bg-slate-50 bg-red"
            style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}
        >
            {/* Sidebar */}
            <Sidebar />

            {/* Contenido dinámico */}
            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
