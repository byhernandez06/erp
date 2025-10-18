import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout as logoutAction } from "@/store/slices/authSlice";
import { getCurrentUser, signOutUser } from "@/services/authService";
import type { RootState } from "@/store/store";

interface AuthContextType {
    user: { uid: string; email: string | null } | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Verificar si hay un token guardado en localStorage
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        const currentUser = await getCurrentUser(token);
                        if (currentUser) {
                            dispatch(setUser(currentUser));
                        } else {
                            // Token inválido, removerlo
                            localStorage.removeItem('authToken');
                            dispatch(setUser(null));
                        }
                    } catch (error) {
                        // Error al verificar token, removerlo
                        localStorage.removeItem('authToken');
                        dispatch(setUser(null));
                    }
                } else {
                    dispatch(setUser(null));
                }
            } catch (error) {
                console.error('Error inicializando autenticación:', error);
                localStorage.removeItem('authToken');
                dispatch(setUser(null));
            } finally {
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, [dispatch]);

    const logout = async () => {
        try {
            await signOutUser();
        } catch (error) {
            console.error('Error en logout del servidor:', error);
        } finally {
            localStorage.removeItem('authToken');
            dispatch(logoutAction());
            window.location.href = '/login';
        }
    };

    if (!isInitialized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    const contextValue: AuthContextType = {
        user,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;