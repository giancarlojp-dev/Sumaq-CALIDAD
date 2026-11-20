import { mockAlertas, mockInventory, mockMovimientos, mockOperarios, mockProyectos, mockQaRegistros, mockRecomendaciones, mockTareas } from "@/lib/mock-ai-data";
import { getOperationalContext } from "@/lib/operational-context";
import type { AlertLevel, InventoryCategory, InventoryItem } from "@/types/ai";

export const aiService = {
  async recomendarUbicacion(idItem: string) {
    const item = mockInventory.find((entry) => entry.id === idItem);
    const zonas = ["Zona A", "Zona B", "Zona C"] as const;
    return {
      idItem,
      sugerida: (item?.stockActual ?? 0) <= (item?.puntoReorden ?? 0) ? "Zona C" : zonas[(item?.stockActual ?? 0) % zonas.length],
      modelo: "collaborative-filtering",
    };
  },

  async predecirDemanda(categoria: InventoryCategory, diasFuturo: number) {
    const items = mockInventory.filter((entry) => entry.categoria === categoria);
    const volumen = items.reduce((acc, item) => acc + item.demandaPromedio, 0);
    return {
      categoria,
      diasFuturo,
      volumenEstimado: Math.max(12, Math.round(volumen * (diasFuturo / 7))),
      modelo: "regresion-lineal",
    };
  },

  async addInventoryItem(item: Partial<InventoryItem> & { nombre: string; categoria: InventoryCategory; demandaPromedio: number; stockActual?: number }) {
    const nextId = `inv-${mockInventory.length + 1}`;
    const newItem: InventoryItem = {
      id: nextId,
      nombre: item.nombre,
      categoria: item.categoria,
      stockActual: item.stockActual ?? 0,
      ubicacion: item.ubicacion ?? "Zona A",
      puntoReorden: item.puntoReorden ?? 10,
      capacidadMaxima: item.capacidadMaxima ?? 100,
      demandaPromedio: item.demandaPromedio,
      proveedor: item.proveedor ?? "Desconocido",
      ultimoMovimiento: item.ultimoMovimiento ?? "-",
    };

    mockInventory.push(newItem);

    return newItem;
  },

  async consultarChatbot(textoUsuario: string) {
    const lower = textoUsuario.toLowerCase();
    const context = getOperationalContext();
    const criticos = context.criticalInventory;
    const tareasUrgentes = context.urgentTasks;
    const operariosDisponibles = context.availableOperators;
    const proyectosActivos = context.activeProjects;
    const alertasCriticas = context.criticalAlerts;
    const tareasCompletadas = context.completedTasks;
    const productosConMayorDemanda = context.topDemandItems;
    const latestLabel = context.latestLabel;
    const latestValues = context.latestValues;

    if (lower.includes("hola") || lower.includes("resumen") || lower.includes("ayuda") || lower.includes("qué pasa") || lower.includes("estado")) {
      return {
        respuesta: `Resumen ejecutivo: hay ${criticos.length} productos críticos, ${tareasUrgentes.length} tareas urgentes, ${operariosDisponibles.length} operarios disponibles y ${proyectosActivos.length} proyectos activos. El foco ahora es reabastecer agua, revisar cargadores USB-C, sostener la operación de campaña y cubrir los puntos con mayor riesgo.`,
        intent: "resumen_ejecutivo",
      };
    }

    if (lower.includes("mes") || lower.includes("mensual") || lower.includes("entrada") || lower.includes("salida") || lower.includes("estadistica") || lower.includes("estadísticas")) {
      return {
        respuesta: `En ${latestLabel} se registraron ${latestValues.entradas} entradas y ${latestValues.salidas} salidas. En total hay ${context.totalInventory} productos activos, ${tareasUrgentes.length} tareas urgentes y ${tareasCompletadas.length} tareas completadas.`,
        intent: "estadisticas_mensuales",
      };
    }

    if (lower.includes("demanda") || lower.includes("más demand") || lower.includes("más vendido") || lower.includes("popular")) {
      return {
        respuesta: `Los productos con mayor demanda son ${productosConMayorDemanda.map((item) => `${item.nombre} (${item.demandaPromedio} und./semana)`).join(", ")}.`,
        intent: "demanda",
      };
    }

    if (lower.includes("producto") || lower.includes("productos") || lower.includes("stock") || lower.includes("inventario")) {
      return {
        respuesta: `Hay ${context.totalInventory} productos registrados. ${criticos.length} están en stock crítico y los más urgentes son ${criticos.slice(0, 5).map((item) => `${item.nombre} (${item.stockActual}/${item.puntoReorden})`).join(", ")}.`,
        intent: "estado_stock",
      };
    }

    if (lower.includes("tarea") || lower.includes("trabajo") || lower.includes("pendiente") || lower.includes("completada")) {
      return {
        respuesta: `Tienes ${tareasUrgentes.length} tareas pendientes o de alta prioridad y ${tareasCompletadas.length} tareas completadas. La más urgente es “${tareasUrgentes[0]?.titulo}”, asignada a ${tareasUrgentes[0]?.asignadoA}.`,
        intent: "estado_tareas",
      };
    }

    if (lower.includes("operario") || lower.includes("personal") || lower.includes("turno")) {
      return {
        respuesta: `${operariosDisponibles.length} operarios están disponibles ahora. ${operariosDisponibles.map((person) => `${person.nombre} (${person.area})`).join("; ")}.`,
        intent: "estado_operarios",
      };
    }

    if (lower.includes("proyecto") || lower.includes("campaña")) {
      return {
        respuesta: `Hay ${proyectosActivos.length} proyectos activos: ${proyectosActivos.map((project) => project.nombre).join(", ")}. El más sensible sigue siendo la campaña de verano por la demanda de agua y alimentos.`,
        intent: "estado_proyectos",
      };
    }

    if (lower.includes("alerta") || lower.includes("riesgo") || lower.includes("qa")) {
      return {
        respuesta: `Hay ${alertasCriticas.length} alertas críticas y ${mockQaRegistros.filter((registro) => registro.estadoQa === "En Revisión").length} registros QA en revisión. El foco está en agua, cargadores y parlantes.`,
        intent: "estado_alertas",
      };
    }

    return {
      respuesta: `Puedo ayudarte con inventario, tareas, operarios, proyectos, alertas, QA y métricas mensuales. Prueba preguntas como “¿Qué productos están críticos?” o “¿Qué entradas y salidas hubo este mes?”.`,
      intent: "ayuda_general",
    };
  },

  async optimizarInventario(idItem: string) {
    const item = mockInventory.find((entry) => entry.id === idItem);
    const stock = item?.stockActual ?? 0;
    const punto = item?.puntoReorden ?? 0;
    let nivel: AlertLevel = "Verde";
    let cantidad = 0;

    if (stock <= punto - 5) {
      nivel = "Rojo";
      cantidad = punto + 10 - stock;
    } else if (stock <= punto) {
      nivel = "Amarillo";
      cantidad = punto - stock;
    }

    return {
      idItem,
      nivel,
      cantidadSugerida: cantidad,
      modelo: "logica-difusa",
    };
  },

  async obtenerResumen() {
    return {
      alertas: mockAlertas,
      inventario: mockInventory,
      qa: mockQaRegistros,
      recomendaciones: mockRecomendaciones,
      operarios: mockOperarios,
      tareas: mockTareas,
      proyectos: mockProyectos,
      movimientos: mockMovimientos,
    };
  },
};
