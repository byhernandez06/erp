import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import logo from "@/assets/images/logo-muni.png";

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            const { token, user } = response.data;

            // Guardar token localmente
            localStorage.setItem("token", token);

            // Actualizar usuario global
            dispatch(setUser(user));

            // Redirigir al dashboard
            navigate("/dashboard");
        } catch (err: any) {
            console.error("Error al iniciar sesión:", err);
            setError("Usuario o contraseña inválidos");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-background-light dark:bg-background-dark shadow-lg rounded-xl">
                <img src={logo} alt="Logo Municipalidad CR" className="h-24 w-auto mx-auto" />

                <h2 className="text-center text-3xl font-bold text-content-light dark:text-content-dark">
                    Iniciar Sesión
                </h2>

                {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="rounded-md -space-y-px">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark" size={20} />
                            <input
                                id="email"
                                type="text"
                                placeholder="Usuario"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-border-light dark:border-border-dark placeholder-subtle-light dark:placeholder-subtle-dark text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition"
                            />
                        </div>

                        <div className="relative pt-4">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark" size={20} />
                            <input
                                id="password"
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-border-light dark:border-border-dark placeholder-subtle-light dark:placeholder-subtle-dark text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center text-sm text-content-light dark:text-content-dark">
                            <input type="checkbox" className="h-4 w-4 text-primary rounded mr-2" /> Recordarme
                        </label>
                        <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                            ¿Olvidó su contraseña?
                        </a>
                    </div>

                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
