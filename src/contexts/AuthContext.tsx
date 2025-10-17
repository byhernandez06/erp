import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/authSlice";
import { getCurrentUser } from "@/services/authService";
import type { RootState } from "@/store/store";

interface AuthContextType {
    user: { uid: string; email: string | null } | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
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
                    const currentUser = await getCurrentUser(token);
                    if (currentUser) {
                        dispatch(setUser(currentUser));
                    } else {
                        // Token inválido, removerlo
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

    const login = async (email: string, password: string) => {
        // Esta función será implementada en el componente LoginPage
        // ya que necesita importar el servicio de autenticación
        throw new Error('Login debe ser manejado por el componente LoginPage');
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        dispatch(setUser(null));
        window.location.href = '/login';
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
        login,
        logout
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;