export const getProjectFromAccount = (cuenta: string | undefined | null): string => {
    if (!cuenta) return "—";

    const clean = cuenta.trim().replace(",", "."); // normalizar separadores
    const niveles = clean.split(".");

    // Tomar los primeros 3 niveles, ejemplo: "5.02.25"
    const base = niveles.slice(0, 3).join(".");

    const proyectos: Record<string, string> = {
        "5.01.01": "Administración General",
        "5.01.02": "Auditoría Interna",
        "5.01.03": "Administración de Inversiones Propias",
        "5.01.04": "Registro de la Deuda, Fondos y Transferencias",
        "5.02.02": "Servicio de Recolección de Basura",
        "5.02.03": "Caminos y Calles",
        "5.02.09": "Educativos, Culturales y Deportivos",
        "5.02.10": "Servicios Sociales y Complementarios",
        "5.02.15": "Mejoramiento de la Zona Marítimo Terrestre",
        "5.02.16": "Depósito y Tratamiento de Basura",
        "5.02.17": "Mantenimiento de Edificios",
        "5.02.25": "Protección del Medio Ambiente",
        "5.02.26": "Desarrollo Urbano",
        "5.02.28": "Atención de Emergencias",
        "5.03.01": "Edificaciones",
        "5.03.02": "Vías de Comunicación",
        "5.03.06": "Otros Proyectos",
        "5.03.07": "Otros Fondos e Inversiones",
        "5.04.02": "Partidas Específicas - Vías de Comunicación",
        "5.04.06": "Partidas Específicas - Otros Proyectos",
    };

    // Devolver el nombre correspondiente o un valor por defecto
    return proyectos[base] || "No definido";
};
