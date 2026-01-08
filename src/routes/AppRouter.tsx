// ✅ src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

// Layout
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdenesCompraPage from "@/pages/OrdenesCompraPage";
import VendorsMenuPage from "@/pages/VendorsMenuPage";
import VendorsManagementPage from "@/pages/VendorsManagementPage";

const AppRouter = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <Routes>
            {user ? (
                // 🔹 Rutas protegidas dentro del layout persistente
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/proveedores-menu" element={<VendorsMenuPage />} />
                    <Route path="/proveeduria" element={<OrdenesCompraPage />} />
                    <Route path="/gestionar-proveedores" element={<VendorsManagementPage />} />
                    <Route path="/entradas-compra" element={<Placeholder title="Entradas x Compra" />} />
                    <Route path="/entradas-ajustes" element={<Placeholder title="Entradas x Ajustes" />} />
                    <Route path="/salidas-ajustes" element={<Placeholder title="Salidas x Ajustes" />} />
                    <Route path="/salidas-requisicion" element={<Placeholder title="Salidas x Requisición" />} />
                    <Route path="/buscar-ordenes" element={<Placeholder title="Buscar Órdenes" />} />
                    <Route path="/compromisos" element={<Placeholder title="Compromisos" />} />
                    <Route path="/reservas" element={<Placeholder title="Reservas" />} />
                    <Route path="/consultar-cheques" element={<Placeholder title="Consultar Cheques" />} />
                    <Route path="/consultar-ordenes" element={<Placeholder title="Consultar Órdenes" />} />
                    <Route path="/consultar-transferencias" element={<Placeholder title="Consultar Transferencias" />} />
                    <Route path="/gestionar-proveedores" element={<Placeholder title="Gestión de Proveedores" />} />
                    <Route path="/nomina-pago" element={<Placeholder title="Nómina de Pago" />} />
                    <Route path="/familias" element={<Placeholder title="Familias" />} />
                    <Route path="/articulos" element={<Placeholder title="Artículos" />} />
                    <Route path="/costos" element={<Placeholder title="Costos" />} />
                    <Route path="/saldos-actuales" element={<Placeholder title="Saldos Actuales" />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Route>
            ) : (
                // 🔸 Rutas públicas (login)
                <>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </>
            )}
        </Routes>
    );
};

// 🔹 Componente simple temporal para placeholders
const Placeholder = ({ title }: { title: string }) => (
    <div className="p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p>Funcionalidad en desarrollo</p>
    </div>
);

export default AppRouter;
