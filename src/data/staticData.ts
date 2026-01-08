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
    { id: 1, nombre: "Administración General" },
    { id: 2, nombre: "Auditoría Interna" },
    { id: 3, nombre: "Administración de Inversiones Propias" },
    { id: 4, nombre: "Registro de la Deuda, Fondos y Transferencias" },
    { id: 5, nombre: "Servicio de Recolección de Basura" },
    { id: 6, nombre: "Caminos y Calles" },
    { id: 7, nombre: "Educativos, Culturales y Deportivos" },
    { id: 8, nombre: "Servicios Sociales y Complementarios" },
    { id: 9, nombre: "Mejoramiento de la Zona Marítimo Terrestre" },
    { id: 10, nombre: "Depósito y Tratamiento de Basura" },
    { id: 11, nombre: "Mantenimiento de Edificios" },
    { id: 12, nombre: "Protección del Medio Ambiente" },
];


export const solicitantesDummy = [
    { id: 1, nombre: "Carlos Jiménez" },
    { id: 2, nombre: "Andrea Muñoz" },
    { id: 3, nombre: "Daniel Corrales" },
    { id: 4, nombre: "Pamela Rojas" },
    { id: 5, nombre: "María Echandi" },
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