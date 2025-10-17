municipal-erp/
├── src/
│   ├── api/                # Llamadas a APIs o servicios externos
│   ├── assets/             # Imágenes, íconos, fuentes
│   ├── components/         # Componentes reutilizables (botones, modales, etc.)
│   ├── config/             # Configuraciones globales (Firebase, axios, etc.)
│   ├── contexts/           # Contextos globales (AuthContext, ThemeContext)
│   ├── hooks/              # Custom hooks
│   ├── layouts/            # Layouts generales (AdminLayout, PublicLayout)
│   ├── modules/            # Módulos de negocio (Finanzas, Catastro, RecursosHumanos)
│   │   └── example/        # Ejemplo: cada módulo con sus propias vistas, componentes y servicios
│   ├── pages/              # Vistas principales (Login, Dashboard, etc.)
│   ├── routes/             # Rutas y configuración de navegación
│   ├── services/           # Lógica de acceso a datos (ej. FirebaseService)
│   ├── styles/             # Archivos CSS globales o Tailwind
│   ├── utils/              # Funciones utilitarias (formatos, validaciones)
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
