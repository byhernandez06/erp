import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface User {
    uid: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Función para generar un token JWT
const generateToken = (uid: string, email: string): string => {
    return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Función para verificar un token JWT
export const verifyToken = (token: string): { uid: string; email: string } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { uid: string; email: string };
        return decoded;
    } catch (error) {
        return null;
    }
};

// Función para registrar un nuevo usuario
export const registerUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        // Verificar si el usuario ya existe
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if ((existingUsers as any[]).length > 0) {
            throw new Error('El usuario ya existe');
        }

        // Generar hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Generar UID único
        const uid = uuidv4();

        // Insertar el nuevo usuario
        await pool.execute(
            'INSERT INTO users (uid, email, password_hash) VALUES (?, ?, ?)',
            [uid, email, passwordHash]
        );

        // Generar token
        const token = generateToken(uid, email);

        return {
            user: { uid, email },
            token
        };
    } catch (error) {
        console.error('Error registrando usuario:', error);
        throw error;
    }
};

// Función para iniciar sesión
export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        // Buscar el usuario por email
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const userArray = users as any[];
        if (userArray.length === 0) {
            throw new Error('Usuario o contraseña inválidos');
        }

        const user = userArray[0];

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Usuario o contraseña inválidos');
        }

        // Generar token
        const token = generateToken(user.uid, user.email);

        return {
            user: { uid: user.uid, email: user.email },
            token
        };
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        throw error;
    }
};

// Función para obtener el usuario actual por token
export const getCurrentUser = async (token: string): Promise<User | null> => {
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return null;
        }

        const [users] = await pool.execute(
            'SELECT uid, email FROM users WHERE uid = ?',
            [decoded.uid]
        );

        const userArray = users as any[];
        if (userArray.length === 0) {
            return null;
        }

        return { uid: userArray[0].uid, email: userArray[0].email };
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        return null;
    }
};