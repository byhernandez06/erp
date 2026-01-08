# Integración con Backend API - ERP Municipal

Este documento describe la refactorización del frontend para integrarse con el backend API existente.

## 🔄 Cambios Realizados

### 1. Eliminación de Código de Base de Datos
Se eliminaron todos los archivos relacionados con MySQL directo:
- ❌ `src/config/database.ts`
- ❌ `src/utils/initDatabase.ts`
- ❌ `database-setup.sql`
- ❌ Dependencias: mysql2, bcryptjs (mantenidas por compatibilidad)

### 2. Servicios API Creados

#### `src/services/apiService.ts`
Servicio base para comunicación con el backend:
- Configuración de headers automática
- Manejo de tokens JWT
- Funciones helper para respuestas
- Endpoints configurados:
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`
  - CRUD completo para órdenes (preparado para futura implementación)

### Flujo /auth/me
- Flujo Completo:
  - Usuario hace login → Recibe token → Se guarda en localStorage
  - Usuario cierra navegador → Token permanece guardado
  - Usuario abre la app → Frontend encuentra token → Llama GET /auth/me
  - Si token válido → Usuario sigue autenticado automáticamente
  - Si token inválido → Usuario debe hacer login nuevamente 

#### `src/services/authService.ts`
Servicio de autenticación refactorizado:
- `signInUser()` - Login usando endpoint del backend
- `getCurrentUser()` - Verificación de usuario actual
- `signOutUser()` - Logout del backend

#### `src/services/ordenesDeCompraService.ts`
Servicio para órdenes de compra (preparado para endpoints futuros):
- `crearOrdenDeCompra()`
- `obtenerOrdenesDeCompra()`
- `obtenerOrdenPorId()`
- `actualizarEstadoOrden()`

### 3. Componentes Actualizados

#### `src/pages/LoginPage.tsx`
- ✅ Integrado con endpoint `POST /auth/login`
- ✅ Manejo de tokens JWT
- ✅ Integración con Redux Toolkit
- ✅ Indicador de conexión al backend

#### `src/pages/OrdenesCompraPage.tsx`
- ✅ Datos mock temporales (hasta implementar endpoints)
- ✅ Indicador de modo desarrollo
- ✅ Preparado para integración futura

#### `src/components/OrdenDeCompraModal.tsx`
- ✅ Formulario funcional con validaciones
- ✅ Simulación de guardado (preparado para endpoint)
- ✅ Indicador de funcionalidad pendiente

#### `src/contexts/AuthContext.tsx`
- ✅ Integrado con Redux Toolkit
- ✅ Verificación automática de tokens
- ✅ Logout completo (frontend + backend)

## 🚀 Configuración Actual

### Backend Esperado
- **URL Base**: `http://localhost:3000/api/v1`
- **Endpoints Disponibles**:
  - `POST /auth/login` ✅
  - `POST /auth/register` ✅
  - `POST /auth/logout` (preparado)
  - `GET /auth/me` (preparado)

### Frontend
- **Framework**: React + TypeScript
- **Estado**: Redux Toolkit
- **Autenticación**: JWT en localStorage
- **Comunicación**: Fetch API nativo

## 📋 Estructura de Datos Esperada

### Login Request
```json
{
  "email": "usuario@email.com",
  "password": "contraseña"
}
```

### Login Response
```json
{
  "user": {
    "uid": "user-id",
    "email": "usuario@email.com"
  },
  "token": "jwt-token-aqui"
}
```

### Current User Response
```json
{
  "user": {
    "uid": "user-id", 
    "email": "usuario@email.com"
  }
}
```

## 🔧 Funcionalidades Implementadas

### ✅ Completadas
1. **Autenticación JWT**
   - Login con backend
   - Almacenamiento seguro de tokens
   - Verificación automática al iniciar
   - Logout completo

2. **Interfaz de Usuario**
   - Todas las pantallas funcionales
   - Indicadores de estado de conexión
   - Manejo de errores mejorado

3. **Redux Integration**
   - Estado centralizado
   - Acciones y reducers actualizados
   - Persistencia de sesión

### 🔄 En Desarrollo (Datos Mock)
1. **Órdenes de Compra**
   - Listado con datos de prueba
   - Formulario de creación funcional
   - Exportación PDF/CSV

2. **Dashboard**
   - Métricas básicas
   - Navegación completa

## 🚧 Próximos Pasos

### Endpoints Pendientes de Implementar en Backend
```
POST   /api/v1/ordenes              # Crear orden
GET    /api/v1/ordenes              # Listar órdenes
GET    /api/v1/ordenes/:id          # Obtener orden
PUT    /api/v1/ordenes/:id          # Actualizar orden
DELETE /api/v1/ordenes/:id          # Eliminar orden
PATCH  /api/v1/ordenes/:id/status   # Cambiar estado
```

### Funcionalidades a Completar
1. Conectar formulario de órdenes con backend
2. Implementar filtros y búsqueda
3. Agregar paginación
4. Implementar notificaciones en tiempo real
5. Agregar más módulos del ERP

## 🐛 Notas de Desarrollo

### Variables de Entorno
```
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

### Testing
- Backend debe estar corriendo en puerto 3000
- Endpoints de auth deben estar implementados
- CORS configurado para localhost:5173

### Estructura de Respuestas
El frontend está preparado para manejar diferentes formatos de respuesta del backend, normalizando automáticamente los datos.

## 📞 Soporte

Para dudas sobre la integración:
1. Verificar que el backend esté corriendo
2. Revisar logs de consola del navegador
3. Verificar configuración de CORS
4. Confirmar estructura de respuestas JSON