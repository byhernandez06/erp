# Migración de Firebase a MySQL - ERP Municipal

Este documento describe los cambios realizados para migrar el sistema ERP Municipal de Firebase a MySQL.

## 🔄 Cambios Realizados

### 1. Nuevas Dependencias
Se agregaron las siguientes dependencias al proyecto:
- `mysql2`: Cliente MySQL para Node.js
- `bcryptjs`: Para hash de contraseñas
- `jsonwebtoken`: Para autenticación JWT
- `uuid`: Para generar IDs únicos
- `dotenv`: Para variables de entorno

### 2. Estructura de Base de Datos MySQL

#### Tablas Creadas:
- **users**: Almacena usuarios del sistema
- **buy_orders**: Almacena órdenes de compra
- **buy_order_items**: Almacena items de cada orden

### 3. Archivos Nuevos/Modificados

#### Nuevos Archivos:
- `src/config/database.ts`: Configuración de conexión MySQL
- `src/services/authService.ts`: Servicio de autenticación con JWT
- `src/services/ordenesDeCompraService.ts`: Servicio para órdenes de compra
- `src/utils/initDatabase.ts`: Inicialización de base de datos
- `database-setup.sql`: Script SQL para configurar la base de datos
- `.env.local`: Variables de entorno

#### Archivos Modificados:
- `src/contexts/AuthContext.tsx`: Actualizado para usar JWT
- `src/pages/LoginPage.tsx`: Actualizado para usar nuevo servicio de auth
- `src/pages/ProveeduriaPage.tsx`: Actualizado para usar MySQL
- `src/components/OrdenDeCompraModal.tsx`: Actualizado para usar MySQL
- `src/components/Sidebar.tsx`: Agregado botón de logout
- `src/routes/AppRouter.tsx`: Mejorada gestión de rutas protegidas
- `src/main.tsx`: Agregada inicialización de base de datos

#### Archivos Eliminados/Deprecados:
- `src/firebase/config.ts`: Ya no se usa (mantener para referencia)
- `src/firebase/ordenesDeCompra.ts`: Ya no se usa (mantener para referencia)

## 🚀 Instrucciones de Configuración

### 1. Configurar MySQL
```bash
# Conectar a MySQL como root
mysql -u root -p

# Ejecutar el script de configuración
source database-setup.sql
```

### 2. Configurar Variables de Entorno
El archivo `.env.local` ya está configurado con:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=muni-demo
JWT_SECRET=tu-clave-secreta-muy-segura-cambiar-en-produccion
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Ejecutar la Aplicación
```bash
npm run dev
```

## 👤 Usuario de Prueba

Se ha creado un usuario administrador de prueba:
- **Email**: admin@municipalidad.cr
- **Contraseña**: admin123

## ✨ Nuevas Características

### 1. Autenticación JWT
- Tokens seguros con expiración de 24 horas
- Almacenamiento en localStorage
- Verificación automática al cargar la aplicación

### 2. Base de Datos Relacional
- Estructura normalizada
- Relaciones entre tablas con foreign keys
- Índices para mejor rendimiento
- Transacciones para consistencia de datos

### 3. Mejor Gestión de Usuarios
- Hash seguro de contraseñas con bcrypt
- UIDs únicos para cada usuario
- Información de usuario en el sidebar

### 4. Funcionalidades Mejoradas
- Botón de logout con confirmación
- Mejor manejo de errores
- Estados de carga mejorados
- Información de desarrollo en la interfaz

## 🔧 Configuración de Desarrollo

### Estructura de la Base de Datos
```sql
users (id, uid, email, password_hash, created_at, updated_at)
buy_orders (id, uid, licitacion, fecha, numero_orden, proveedor, ...)
buy_order_items (id, order_id, cantidad, unidad, detalle, ...)
```

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Sistema verifica contra base de datos MySQL
3. Se genera token JWT
4. Token se almacena en localStorage
5. Token se valida en cada request

### Flujo de Órdenes de Compra
1. Usuario crea orden en el modal
2. Se guarda en tabla `buy_orders`
3. Items se guardan en tabla `buy_order_items`
4. Se usa transacción para consistencia
5. Lista se actualiza automáticamente

## 🚨 Notas Importantes

1. **Seguridad**: Cambiar `JWT_SECRET` en producción
2. **Base de Datos**: Configurar credenciales MySQL correctas
3. **Backup**: Los datos de Firebase no se migran automáticamente
4. **Testing**: Probar todas las funcionalidades antes de producción

## 📝 Próximos Pasos

1. Migrar datos existentes de Firebase (si es necesario)
2. Configurar base de datos de producción
3. Implementar más funcionalidades de autenticación (recuperar contraseña, etc.)
4. Agregar más validaciones y seguridad
5. Optimizar consultas de base de datos

## 🐛 Solución de Problemas

### Error de Conexión MySQL
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `.env.local`
- Verificar que la base de datos `muni-demo` exista

### Error de Autenticación
- Verificar que el usuario existe en la tabla `users`
- Verificar que el token JWT sea válido
- Limpiar localStorage si hay problemas

### Error al Crear Órdenes
- Verificar que el usuario esté autenticado
- Verificar que las tablas existan
- Verificar logs de consola para más detalles