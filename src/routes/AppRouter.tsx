import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import ProveeduriaPage from "@/pages/ProveeduriaPage";
import { AuthProvider } from "@/contexts/AuthContext";

const AppRouter: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/*" element={<ProtectedRoutes />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

const ProtectedRoutes: React.FC = () => {
    const { user, loading } = useSelector((state: RootState) => state.auth);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <DashboardLayout>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/proveeduria" element={<ProveeduriaPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AppRouter;