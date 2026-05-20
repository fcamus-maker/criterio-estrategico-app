export type HallazgoPanel = {
  id: string;
  codigo: string;
  empresa: string;
  obra: string;
  tipoHallazgo: string;
  criticidad: "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO";
  estado: "REPORTADO" | "ABIERTO" | "EN SEGUIMIENTO" | "CERRADO";
  fechaHora: string;
  fechaISO: string;
  reportante: string;
  cargo: string;
  telefono: string;
  descripcion: string;
  medidaInmediata: string;
  fotos?: string[];
};

export const hallazgosMock: HallazgoPanel[] = [
  {
    id: "1",
    codigo: "CE-PEPM-GB/00031",
    empresa: "Grúa Bustamante",
    obra: "PEPM",
    tipoHallazgo: "Condición subestándar",
    criticidad: "CRÍTICO",
    estado: "ABIERTO",
    fechaHora: "18-04-2026 · 14:32",
    fechaISO: "2026-04-18T14:32:00",
    reportante: "Joaquín Camus",
    cargo: "Ingeniero Proyecto",
    telefono: "+56 9 1234 5678",
    descripcion:
      "Caída de materiales desde altura en sector de acopio. Se observa exposición directa de personal y ausencia de control efectivo del área.",
    medidaInmediata:
      "Suspender la intervención del sector y controlar inmediatamente la exposición a caída de materiales antes de reiniciar actividades.",
      
fotos: [],
  },
  {
    id: "2",
    codigo: "CE-PEPM-TN/00032",
    empresa: "TN",
    obra: "PEPM",
    tipoHallazgo: "Acto subestándar",
    criticidad: "ALTO",
    estado: "EN SEGUIMIENTO",
    fechaHora: "17-04-2026 · 14:40",
    fechaISO: "2026-04-17T14:40:00",
    reportante: "Freddy Camus Tobar",
    cargo: "ITO Seguridad",
    telefono: "+56 9 5102 1388",
    descripcion:
      "Se detecta ejecución de tarea sin control conductual adecuado y sin verificación previa de condición segura del entorno.",
    medidaInmediata:
      "Detener la tarea, reforzar instrucción operativa y validar cumplimiento antes de reiniciar faena.",
      fotos: []
  },
  {
    id: "3",
    codigo: "CE-PEPM-SM/00033",
    empresa: "Servicios Mineros",
    obra: "PEPM",
    tipoHallazgo: "Condición subestándar",
    criticidad: "MEDIO",
    estado: "CERRADO",
    fechaHora: "10-04-2026 · 14:57",
    fechaISO: "2026-04-10T14:57:00",
    reportante: "Marcos Rojas",
    cargo: "Supervisor Terreno",
    telefono: "+56 9 6677 8899",
    descripcion:
      "Se observa desorden en sector de tránsito interno con materiales fuera de zona definida.",
    medidaInmediata:
      "Ordenar el sector, delimitar área y verificar estándar de housekeeping.",
  },
  {
    id: "4",
    codigo: "CE-PEPM-GB/00034",
    empresa: "Grúa Bustamante",
    obra: "PEPM",
    tipoHallazgo: "Condición subestándar",
    criticidad: "CRÍTICO",
    estado: "ABIERTO",
    fechaHora: "02-04-2026 · 15:05",
    fechaISO: "2026-04-02T15:05:00",
    reportante: "Luis Herrera",
    cargo: "Supervisor Operaciones",
    telefono: "+56 9 4455 7788",
    descripcion:
      "Se identifica condición de exposición a evento de alto potencial por falta de segregación efectiva del área crítica.",
    medidaInmediata:
      "Restringir acceso, implementar segregación física y validar control antes de reanudar operación.",
      fotos: []
  },
];
export const usuarioMock = {
  nombre: "Freddy Camus",
  cargo: "Ingeniero en Prevención de Riesgos",
  empresa: "Criterio Estratégico",
  rol: "Administrador ejecutivo",
  telefono: "+56 9 1234 5678",
  correo: "freddy.camus@criterioestrategico.cl",
  foto: "",
};
export const notificacionesMock = [
  {
    id: "notif-critico-00031",
    hallazgoId: "1",
    mensaje: "Hallazgo crítico pendiente de revisión",
    titulo: "Hallazgo crítico pendiente de revisión",
    fechaHora: "22-04-2026 14:32",
    criticidad: "CRÍTICO",
    estado: "Pendiente de revisión",
    empresa: "Grúa Bustamante",
    obra: "PEPM",
    descripcion:
      "El hallazgo crítico CE-PEPM-GB/00031 requiere validación ejecutiva y definición de responsable de cierre.",
    accionRecomendada:
      "Revisar evidencia, confirmar segregación del área y asignar responsable de corrección antes de liberar la actividad.",
    leida: false,
  },
  {
    id: "notif-nuevo-reporte-00034",
    hallazgoId: "4",
    mensaje: "Nuevo reporte ingresado desde terreno",
    titulo: "Nuevo reporte ingresado desde terreno",
    fechaHora: "22-04-2026 13:10",
    criticidad: "CRÍTICO",
    estado: "Nuevo reporte",
    empresa: "Grúa Bustamante",
    obra: "PEPM",
    descripcion:
      "Se registró un nuevo reporte desde terreno con exposición potencial alta en zona operacional crítica.",
    accionRecomendada:
      "Validar controles inmediatos, revisar fotografías disponibles y priorizar revisión del supervisor de área.",
    leida: false,
  },
  {
    id: "notif-informe-ejecutivo",
    mensaje: "Informe ejecutivo actualizado",
    titulo: "Informe ejecutivo actualizado",
    fechaHora: "22-04-2026 11:45",
    criticidad: "MEDIO",
    estado: "Actualizado",
    empresa: "Cliente corporativo",
    obra: "Panel ejecutivo",
    descripcion:
      "Los indicadores ejecutivos fueron recalculados con el último set de hallazgos disponible en el panel.",
    accionRecomendada:
      "Revisar variaciones de criticidad, cierres y tendencias antes de compartir el informe con gerencia.",
    leida: false,
  },
  {
    id: "notif-seguimiento-00032",
    hallazgoId: "2",
    mensaje: "Seguimiento pendiente en hallazgo abierto",
    titulo: "Seguimiento pendiente en hallazgo abierto",
    fechaHora: "22-04-2026 09:20",
    criticidad: "ALTO",
    estado: "En seguimiento",
    empresa: "TN",
    obra: "PEPM",
    descripcion:
      "El hallazgo CE-PEPM-TN/00032 mantiene acciones en curso y requiere consolidar evidencia de corrección.",
    accionRecomendada:
      "Solicitar evidencia fotográfica/documental y registrar observación de validación para avanzar el cierre.",
    leida: false,
  },
];
