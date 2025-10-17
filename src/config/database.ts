import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'muni-demo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear el pool de conexiones
export const pool = mysql.createPool(dbConfig);

// Función para inicializar las tablas
export const initializeDatabase = async () => {
    try {
        // Crear tabla de usuarios
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uid VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de órdenes de compra
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS buy_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uid VARCHAR(255) NOT NULL,
                licitacion VARCHAR(255),
                fecha DATE,
                numero_orden VARCHAR(255),
                proveedor VARCHAR(255),
                descripcion TEXT,
                proyecto VARCHAR(255),
                lugar_entrega VARCHAR(255),
                solicitante VARCHAR(255),
                cedula_juridica VARCHAR(255),
                estado ENUM('Pendiente', 'En proceso', 'Completado') DEFAULT 'Pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_uid (uid),
                INDEX idx_estado (estado),
                INDEX idx_created_at (created_at)
            )
        `);

        // Crear tabla de items de órdenes de compra
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS buy_order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                cantidad INT NOT NULL,
                unidad VARCHAR(100),
                detalle TEXT,
                cuenta VARCHAR(255),
                nombre VARCHAR(255),
                costo_unitario DECIMAL(10,2),
                monto_total DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES buy_orders(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id)
            )
        `);

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
        throw error;
    }
};

export default pool;