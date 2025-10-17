// src/pages/DashboardPage.tsx
import React from "react";

const DashboardPage: React.FC = () => {
    return (
        <>
            <h1 className="text-[#0d141b] text-[32px] font-bold mb-6">
                Panel de Administración
            </h1>

            {/* --- Sección 1 --- */}
            <h2 className="text-[#0d141b] text-[22px] font-bold mb-4">
                Resumen de Proveeduría
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <SummaryCard title="Total de Proveedores" value="125" />
                <SummaryCard title="Nuevos Proveedores este Mes" value="15" />
                <SummaryCard title="Órdenes de Compra Pendientes" value="8" />
                <SummaryCard title="Órdenes Completadas" value="42" />
                <SummaryCard title="Monto Total Compras" value="₡125,000,000" />
                <SummaryCard title="Solicitudes en Revisión" value="4" />
            </div>

            {/* --- Sección 2 --- */}
            <h2 className="text-[#0d141b] text-[22px] font-bold mb-4">
                Resumen de Finanzas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <SummaryCard title="Presupuesto Total" value="₡800,000,000" />
                <SummaryCard title="Gastos del Mes" value="₡120,000,000" />
                <SummaryCard title="Ingresos del Mes" value="₡150,000,000" />
                <SummaryCard title="Balance Actual" value="₡30,000,000" />
                <SummaryCard title="Facturas Pendientes" value="12" />
                <SummaryCard title="Pagos Completados" value="58" />
            </div>

            {/* --- Sección 3 --- */}
            {/* <h2 className="text-[#0d141b] text-[22px] font-bold mb-4">
                Resumen de Recursos Humanos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title="Empleados Activos" value="230" />
                <SummaryCard title="Nuevas Contrataciones" value="5" />
                <SummaryCard title="Vacaciones Pendientes" value="42" />
                <SummaryCard title="Solicitudes en Proceso" value="7" />
                <SummaryCard title="Capacitaciones Completadas" value="18" />
                <SummaryCard title="Evaluaciones Pendientes" value="9" />
            </div> */}
        </>
    );
};

interface SummaryCardProps {
    title: string;
    value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => (
    <div className="flex flex-col justify-between rounded-xl border border-[#cfdbe7] bg-white shadow-sm p-6 transition hover:shadow-md">
        <p className="text-[#4c739a] text-sm font-medium">{title}</p>
        <p className="text-[#0d141b] text-[1.375rem] font-bold mt-2">{value}</p>
    </div>
);

export default DashboardPage;
