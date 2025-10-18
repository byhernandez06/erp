import React, { useState } from "react";
import { signInUser } from "@/services/authService";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";
import { User, Lock } from "lucide-react";
import logo from "@/assets/images/logo-oreamuno.png";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { user, token } = await signInUser(email, password);
            
            // Guardar el token en localStorage
            localStorage.setItem('authToken', token);
            
            // Actualizar el estado de Redux
            dispatch(setUser(user));
            
            // Redirigir al dashboard
            window.location.href = "/";
        } catch (err: any) {
            console.error('Error en login:', err);
            setError(err.message || "Usuario o contraseña inválidos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-background-light dark:bg-background-dark shadow-lg rounded-xl">
                {/* Logo */}
                <img
                    src={logo}
                    alt="Logo de la Municipalidad de Oreamuno"
                    className="h-24 w-auto mx-auto"
                />

                {/* Título */}
                <h2 className="text-center text-3xl font-bold text-content-light dark:text-content-dark">
                    Iniciar Sesión
                </h2>

                {/* Error */}
                {error && (
                    <p className="text-red-500 text-center text-sm font-medium">{error}</p>
                )}

                {/* Formulario */}
                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="rounded-md -space-y-px">
                        {/* Usuario */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark" size={20} />
                            <input
                                id="email"
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3
                                    border border-border-light dark:border-border-dark
                                    placeholder-subtle-light dark:placeholder-subtle-dark
                                    text-content-light dark:text-content-dark
                                    bg-background-light dark:bg-background-dark
                                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                                    sm:text-sm transition disabled:opacity-50"
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="relative pt-4">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 -translate-y-[1px] text-subtle-light dark:text-subtle-dark" size={20} />
                            <input
                                id="password"
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3
                                    border border-border-light dark:border-border-dark
                                    placeholder-subtle-light dark:placeholder-subtle-dark
                                    text-content-light dark:text-content-dark
                                    bg-background-light dark:bg-background-dark
                                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                                    sm:text-sm transition disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Recordarme + link */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark focus:ring-primary rounded"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-content-light dark:text-content-dark"
                            >
                                Recordarme
                            </label>
                        </div>
                        <div className="text-sm">
                            <a
                                href="#"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                ¿Olvidó su contraseña?
                            </a>
                        </div>
                    </div>

                    {/* Botón */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium
                                rounded-lg text-white bg-primary hover:bg-primary/90
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </div>
                </form>

                {/* Información de desarrollo */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                        <strong>Conectado al Backend:</strong> http://localhost:3000
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">
                        Endpoints disponibles: /auth/login, /auth/register
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;