import { mockAlertas, mockInventory, mockMovimientos, mockOperarios, mockProyectos, mockQaRegistros, mockTareas } from "@/lib/mock-ai-data";

const formatMonth = (key: string) => {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" });
};

export function getOperationalContext() {
  const criticalInventory = mockInventory.filter((item) => item.stockActual <= item.puntoReorden);
  const urgentTasks = mockTareas.filter((task) => task.prioridad === "Alta" || task.estado === "Pendiente");
  const availableOperators = mockOperarios.filter((person) => person.estado === "Disponible");
  const activeProjects = mockProyectos.filter((project) => project.estado === "En curso");
  const criticalAlerts = mockAlertas.filter((alerta) => alerta.nivelAlerta === "Rojo");
  const completedTasks = mockTareas.filter((task) => task.estado === "Completada");
  const topDemandItems = [...mockInventory].sort((a, b) => b.demandaPromedio - a.demandaPromedio).slice(0, 3);
  const qaInReview = mockQaRegistros.filter((registro) => registro.estadoQa === "En Revisión").length;

  const monthlySummary = mockMovimientos.reduce<Record<string, { entradas: number; salidas: number }>>((acc, movimiento) => {
    const [year, month] = movimiento.fecha.split("-");
    const key = `${year}-${month}`;
    if (!acc[key]) acc[key] = { entradas: 0, salidas: 0 };
    if (movimiento.tipoMovimiento === "Entrada") acc[key].entradas += movimiento.cantidad;
    else acc[key].salidas += movimiento.cantidad;
    return acc;
  }, {});

  const latestMonth = Object.entries(monthlySummary).sort(([a], [b]) => a.localeCompare(b)).pop();
  const latestLabel = latestMonth ? formatMonth(latestMonth[0]) : "el último mes";
  const latestValues = latestMonth ? latestMonth[1] : { entradas: 0, salidas: 0 };

  return {
    criticalInventory,
    urgentTasks,
    availableOperators,
    activeProjects,
    criticalAlerts,
    completedTasks,
    topDemandItems,
    qaInReview,
    latestLabel,
    latestValues,
    totalInventory: mockInventory.length,
  };
}

export function buildLocalBoardAnalysis(board: any, question?: string) {
  const columns = board?.columns ?? [];
  const allTasks = columns.flatMap((column: any) => column.tasks ?? []);
  const criticalTasks = allTasks.filter((task: any) => task.priority === "CRITICAL" || task.priority === "HIGH");
  const pendingTasks = allTasks.filter((task: any) => task.priority === "MEDIUM" || task.priority === "HIGH");
  const memberCount = board?.members?.length ?? 0;
  const questionText = question?.trim() ? question.trim() : "Genera un análisis general del tablero y su estado.";
  const context = getOperationalContext();

  const sections = [
    `Pregunta: ${questionText}`,
    `Resumen local del tablero: ${board?.title ?? "Tablero sin nombre"} tiene ${memberCount} miembros, ${allTasks.length} tareas activas y ${criticalTasks.length} tareas de alta prioridad.`,
    `Estado operativo de referencia: ${context.criticalInventory.length} productos en stock crítico, ${context.urgentTasks.length} tareas urgentes, ${context.availableOperators.length} operarios disponibles y ${context.activeProjects.length} proyectos activos.`,
    `Observaciones: las tareas más sensibles están concentradas en reabastecimiento, inventario crítico y despachos de campaña. Revisa primero los ítems con stock bajo y prioriza los turnos con mayor demanda.`,
    `Acción recomendada: asigna responsables a ${pendingTasks.length} tareas pendientes y confirma reabastecimiento para los productos con menor stock antes del siguiente turno.`,
  ];

  return sections.join("\n\n");
}
