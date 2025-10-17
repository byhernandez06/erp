import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

// Layout
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProveeduriaPage from "@/pages/ProveeduriaPage";

const AppRouter = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                {user ? (
                    // 🔹 Rutas protegidas dentro del layout persistente
                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/proveeduria" element={<ProveeduriaPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
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
