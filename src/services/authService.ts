import { authAPI } from './apiService';

export interface User {
    uid: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Función para iniciar sesión
export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await authAPI.login(email, password);

        // Asumir que el backend devuelve: { user: { uid, email }, token }
        if (!response.user || !response.token) {
            throw new Error('Respuesta inválida del servidor');
        }

        return {
            user: {
                uid: response.user.uid || response.user.id,
                email: response.user.email
            },
            token: response.token
        };
    } catch (error: any) {
        console.error('Error en login:', error);
        throw new Error(error.message || 'Error al iniciar sesión');
    }
};

// Función para obtener el usuario actual
export const getCurrentUser = async (token: string): Promise<User | null> => {
    try {
        const response = await authAPI.getCurrentUser(token); // pasamos token

        if (!response.user) {
            return null;
        }

        return {
            uid: response.user.uid || response.user.id,
            email: response.user.email
        };
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        return null;
    }
};


// Función para cerrar sesión
export const signOutUser = async (): Promise<void> => {
    try {
        await authAPI.logout();
    } catch (error) {
        console.error('Error en logout:', error);
        // No lanzar error, permitir logout local
    }
};