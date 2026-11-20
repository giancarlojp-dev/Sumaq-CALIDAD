export type InventoryCategory = "Alimentos" | "Bebidas" | "Limpieza" | "Electrónica" | "Textiles";
export type AlertLevel = "Rojo" | "Amarillo" | "Verde";
export type QaStatus = "Aprobado" | "Rechazado" | "En Revisión";
export type TaskStatus = "Pendiente" | "En progreso" | "Completada" | "Bloqueada";
export type TaskPriority = "Alta" | "Media" | "Baja";

export interface InventoryItem {
  id: string;
  nombre: string;
  categoria: InventoryCategory;
  stockActual: number;
  ubicacion: string;
  puntoReorden: number;
  capacidadMaxima: number;
  demandaPromedio: number;
  proveedor?: string;
  ultimoMovimiento?: string;
}

export interface Movimiento {
  id: string;
  idItem: string;
  fecha: string;
  tipoMovimiento: "Entrada" | "Salida";
  cantidad: number;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "En curso" | "Planeado" | "Cerrado";
}

export interface QaRegistro {
  id: string;
  idItem: string;
  idProyecto: string;
  fecha: string;
  estadoQa: QaStatus;
  observacion: string;
}

export interface Alerta {
  id: string;
  idItem: string;
  fecha: string;
  nivelAlerta: AlertLevel;
  mensaje: string;
  accionSugerida: string;
  responsable?: string;
  area?: string;
}

export interface Recomendacion {
  id: string;
  idItem: string;
  fecha: string;
  ubicacionSugerida: string;
  razon: string;
  impacto?: string;
}

export interface Operario {
  id: string;
  nombre: string;
  turno: "Mañana" | "Tarde" | "Noche";
  area: string;
  especialidad: string;
  estado: "Disponible" | "En ruta" | "En mantenimiento";
  tareasAsignadas: number;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: TaskStatus;
  prioridad: TaskPriority;
  asignadoA: string;
  area: string;
  fechaLimite: string;
  progreso: number;
}
