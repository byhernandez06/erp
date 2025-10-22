// Datos estáticos para el sistema ERP

export const proveedores = [
    {
        id: 1,
        nombre: "Suministros Municipales S.A.",
        cedulaJuridica: "3-101-123456"
    },
    {
        id: 2,
        nombre: "Tecnología y Equipos Ltda.",
        cedulaJuridica: "3-102-654321"
    },
    {
        id: 3,
        nombre: "Materiales de Construcción ABC",
        cedulaJuridica: "3-103-789012"
    },
    {
        id: 4,
        nombre: "Papelería y Oficina Central",
        cedulaJuridica: "3-104-345678"
    },
    {
        id: 5,
        nombre: "Servicios Profesionales XYZ",
        cedulaJuridica: "3-105-901234"
    }
];

export const licitaciones = [
    {
        id: 1,
        codigo: "LIC-2024-001",
        descripcion: "Suministro de Material de Oficina"
    },
    {
        id: 2,
        codigo: "LIC-2024-002", 
        descripcion: "Adquisición de Equipos de Cómputo"
    },
    {
        id: 3,
        codigo: "LIC-2024-003",
        descripcion: "Materiales de Construcción y Mantenimiento"
    },
    {
        id: 4,
        codigo: "LIC-2024-004",
        descripcion: "Servicios de Consultoría Técnica"
    }
];

export const proyectos = [
    {
        id: 1,
        nombre: "Administración"
    },
    {
        id: 2,
        nombre: "Catastro"
    },
    {
        id: 3,
        nombre: "Obras Públicas"
    },
    {
        id: 4,
        nombre: "Servicios Municipales"
    },
    {
        id: 5,
        nombre: "Desarrollo Social"
    },
    {
        id: 6,
        nombre: "Planificación Urbana"
    },
    {
        id: 7,
        nombre: "Gestión Ambiental"
    },
    {
        id: 8,
        nombre: "Tecnologías de Información"
    }
];

// Función para generar saldo disponible aleatorio
export const generarSaldoAleatorio = (): number => {
    return Math.floor(Math.random() * (5000000 - 500000 + 1)) + 500000; // Entre 500,000 y 5,000,000 colones
};

// Función para formatear moneda en colones
export const formatearColones = (monto: number): string => {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2
    }).format(monto);
};