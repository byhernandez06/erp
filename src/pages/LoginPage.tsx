import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";
import { User, Lock } from "lucide-react"; // <-- íconos Lucide
import logo from "@/assets/images/logo-curridabat.png";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            dispatch(setUser({ uid: user.uid, email: user.email }));
            window.location.href = "/";
        } catch (err: any) {
            console.error(err);
            setError("Usuario o contraseña inválidos");
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
                                id="username"
                                type="text"
                                placeholder="Usuario"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3
                                    border border-border-light dark:border-border-dark
                                    placeholder-subtle-light dark:placeholder-subtle-dark
                                    text-content-light dark:text-content-dark
                                    bg-background-light dark:bg-background-dark
                                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                                    sm:text-sm transition"
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
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3
                                    border border-border-light dark:border-border-dark
                                    placeholder-subtle-light dark:placeholder-subtle-dark
                                    text-content-light dark:text-content-dark
                                    bg-background-light dark:bg-background-dark
                                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                                    sm:text-sm transition"
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
                            className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium
                                rounded-lg text-white bg-primary hover:bg-primary/90
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                                transition-colors"
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
