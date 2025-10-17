-- Script para configurar la base de datos MySQL para el ERP Municipal
-- Ejecutar este script en MySQL antes de iniciar la aplicación

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `muni-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `muni-demo`;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `uid` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_uid` (`uid`),
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de órdenes de compra
CREATE TABLE IF NOT EXISTS `buy_orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `uid` VARCHAR(255) NOT NULL,
    `licitacion` VARCHAR(255),
    `fecha` DATE,
    `numero_orden` VARCHAR(255),
    `proveedor` VARCHAR(255),
    `descripcion` TEXT,
    `proyecto` VARCHAR(255),
    `lugar_entrega` VARCHAR(255),
    `solicitante` VARCHAR(255),
    `cedula_juridica` VARCHAR(255),
    `estado` ENUM('Pendiente', 'En proceso', 'Completado') DEFAULT 'Pendiente',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_uid` (`uid`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_numero_orden` (`numero_orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de items de órdenes de compra
CREATE TABLE IF NOT EXISTS `buy_order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `cantidad` INT NOT NULL,
    `unidad` VARCHAR(100),
    `detalle` TEXT,
    `cuenta` VARCHAR(255),
    `nombre` VARCHAR(255),
    `costo_unitario` DECIMAL(10,2),
    `monto_total` DECIMAL(10,2),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `buy_orders`(`id`) ON DELETE CASCADE,
    INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador de prueba
-- Contraseña: admin123 (hash generado con bcrypt)
INSERT IGNORE INTO `users` (`uid`, `email`, `password_hash`) VALUES 
('admin-uuid-123', 'admin@municipalidad.cr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insertar datos de prueba para órdenes de compra
INSERT IGNORE INTO `buy_orders` (`uid`, `licitacion`, `fecha`, `numero_orden`, `proveedor`, `descripcion`, `proyecto`, `lugar_entrega`, `solicitante`, `cedula_juridica`, `estado`) VALUES 
('admin-uuid-123', 'Licitacion 1', '2024-01-15', 'ORD-001', 'Proveedor ABC S.A.', 'Compra de material de oficina', 'Proyecto Administrativo', 'Oficinas Municipales', 'Juan Pérez', '3-101-123456', 'Completado'),
('admin-uuid-123', 'Licitacion 2', '2024-01-20', 'ORD-002', 'Suministros XYZ Ltda.', 'Equipos de cómputo', 'Modernización IT', 'Departamento de Sistemas', 'María González', '3-102-654321', 'En proceso'),
('admin-uuid-123', 'Licitacion 1', '2024-01-25', 'ORD-003', 'Construcciones DEF', 'Materiales de construcción', 'Reparación de calles', 'Bodega Municipal', 'Carlos Rodríguez', '3-103-789012', 'Pendiente');

-- Insertar items de prueba para las órdenes
INSERT IGNORE INTO `buy_order_items` (`order_id`, `cantidad`, `unidad`, `detalle`, `cuenta`, `nombre`, `costo_unitario`, `monto_total`) VALUES 
-- Items para ORD-001
(1, 50, 'Unidades', 'Papel bond tamaño carta', '12345', 'Papel bond', 2.50, 125.00),
(1, 10, 'Cajas', 'Bolígrafos azules', '12346', 'Bolígrafos', 15.00, 150.00),
(1, 5, 'Unidades', 'Grapadoras de oficina', '12347', 'Grapadoras', 25.00, 125.00),

-- Items para ORD-002
(2, 3, 'Unidades', 'Computadoras de escritorio', '54321', 'Computadoras', 800.00, 2400.00),
(2, 3, 'Unidades', 'Monitores LED 24 pulgadas', '54322', 'Monitores', 300.00, 900.00),
(2, 1, 'Unidades', 'Impresora multifuncional', '54323', 'Impresora', 450.00, 450.00),

-- Items para ORD-003
(3, 100, 'Sacos', 'Cemento Portland', '98765', 'Cemento', 8.50, 850.00),
(3, 50, 'Metros', 'Varilla de hierro 1/2 pulgada', '98766', 'Varilla', 12.00, 600.00),
(3, 20, 'Metros cúbicos', 'Arena de río', '98767', 'Arena', 25.00, 500.00);

-- Mostrar resumen de la configuración
SELECT 'Base de datos configurada correctamente' as status;
SELECT COUNT(*) as total_usuarios FROM users;
SELECT COUNT(*) as total_ordenes FROM buy_orders;
SELECT COUNT(*) as total_items FROM buy_order_items;