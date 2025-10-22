import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

// Layout
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProveeduriaPage from "@/pages/ProveeduriaPage";
import ProveedoresMenuPage from "@/pages/ProveedoresMenuPage";

const AppRouter = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                {user ? (
                    // 🔹 Rutas protegidas dentro del layout persistente
                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/proveedores-menu" element={<ProveedoresMenuPage />} />
                        <Route path="/proveeduria" element={<ProveeduriaPage />} />
                        {/* Rutas temporales para las opciones del menú */}
                        <Route path="/entradas-compra" element={<div className="p-6"><h1 className="text-2xl font-bold">Entradas x Compra</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/entradas-ajustes" element={<div className="p-6"><h1 className="text-2xl font-bold">Entradas x Ajustes</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/salidas-ajustes" element={<div className="p-6"><h1 className="text-2xl font-bold">Salidas x Ajustes</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/salidas-requisicion" element={<div className="p-6"><h1 className="text-2xl font-bold">Salidas x Requisición</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/buscar-ordenes" element={<div className="p-6"><h1 className="text-2xl font-bold">Buscar Órdenes</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/compromisos" element={<div className="p-6"><h1 className="text-2xl font-bold">Compromisos</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/reservas" element={<div className="p-6"><h1 className="text-2xl font-bold">Reservas</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/consultar-cheques" element={<div className="p-6"><h1 className="text-2xl font-bold">Consultar Cheques</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/consultar-ordenes" element={<div className="p-6"><h1 className="text-2xl font-bold">Consultar Órdenes</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/consultar-transferencias" element={<div className="p-6"><h1 className="text-2xl font-bold">Consultar Transferencias</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/gestionar-proveedores" element={<div className="p-6"><h1 className="text-2xl font-bold">Gestión de Proveedores</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/nomina-pago" element={<div className="p-6"><h1 className="text-2xl font-bold">Nómina de Pago</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/familias" element={<div className="p-6"><h1 className="text-2xl font-bold">Familias</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/articulos" element={<div className="p-6"><h1 className="text-2xl font-bold">Artículos</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/costos" element={<div className="p-6"><h1 className="text-2xl font-bold">Costos</h1><p>Funcionalidad en desarrollo</p></div>} />
                        <Route path="/saldos-actuales" element={<div className="p-6"><h1 className="text-2xl font-bold">Saldos Actuales</h1><p>Funcionalidad en desarrollo</p></div>} />
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
        </BrowserRouter>
    );
};

export default AppRouter;