import { initializeDatabase } from '../config/database';
import { registerUser } from '../services/authService';

export const setupDatabase = async () => {
    try {
        console.log('Inicializando base de datos...');
        await initializeDatabase();
        
        console.log('Base de datos inicializada correctamente');
        
        // Crear usuario de prueba si no existe
        try {
            await registerUser('admin@municipalidad.cr', 'admin123');
            console.log('Usuario administrador creado: admin@municipalidad.cr / admin123');
        } catch (error: any) {
            if (error.message.includes('ya existe')) {
                console.log('Usuario administrador ya existe');
            } else {
                console.error('Error creando usuario administrador:', error);
            }
        }
        
    } catch (error) {
        console.error('Error configurando la base de datos:', error);
        throw error;
    }
};