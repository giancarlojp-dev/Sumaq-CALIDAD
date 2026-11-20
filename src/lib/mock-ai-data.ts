import type { Alerta, InventoryCategory, InventoryItem, Movimiento, Operario, Proyecto, QaRegistro, Recomendacion, Tarea } from "@/types/ai";

export const inventoryCategories: InventoryCategory[] = ["Alimentos", "Bebidas", "Limpieza", "Electrónica", "Textiles"];

export const mockInventory: InventoryItem[] = [
  { id: "inv-1", nombre: "Arroz Premium", categoria: "Alimentos", stockActual: 42, ubicacion: "Zona A", puntoReorden: 25, capacidadMaxima: 120, demandaPromedio: 18, proveedor: "AgroSumaq", ultimoMovimiento: "Entrada 20 und. hoy" },
  { id: "inv-2", nombre: "Botellas de Agua", categoria: "Bebidas", stockActual: 16, ubicacion: "Zona B", puntoReorden: 20, capacidadMaxima: 100, demandaPromedio: 24, proveedor: "AquaFlow", ultimoMovimiento: "Salida 6 und. ayer" },
  { id: "inv-3", nombre: "Detergente Concentrado", categoria: "Limpieza", stockActual: 33, ubicacion: "Zona A", puntoReorden: 15, capacidadMaxima: 80, demandaPromedio: 12, proveedor: "CleanTech", ultimoMovimiento: "Entrada 15 und. hace 2h" },
  { id: "inv-4", nombre: "Cargador USB-C", categoria: "Electrónica", stockActual: 8, ubicacion: "Zona C", puntoReorden: 10, capacidadMaxima: 60, demandaPromedio: 9, proveedor: "TechCore", ultimoMovimiento: "Salida 4 und. hoy" },
  { id: "inv-5", nombre: "Uniformes Operativos", categoria: "Textiles", stockActual: 55, ubicacion: "Zona B", puntoReorden: 20, capacidadMaxima: 90, demandaPromedio: 10, proveedor: "TextilPro", ultimoMovimiento: "Entrada 12 und. hoy" },
  { id: "inv-6", nombre: "Guantes de Seguridad", categoria: "Limpieza", stockActual: 12, ubicacion: "Zona C", puntoReorden: 18, capacidadMaxima: 70, demandaPromedio: 11, proveedor: "SeguRisk", ultimoMovimiento: "Salida 5 und. esta mañana" },
  { id: "inv-7", nombre: "Aceite Vegetal", categoria: "Alimentos", stockActual: 28, ubicacion: "Zona A", puntoReorden: 20, capacidadMaxima: 90, demandaPromedio: 14, proveedor: "Oleos Peru", ultimoMovimiento: "Entrada 10 und. ayer" },
  { id: "inv-8", nombre: "Gaseosas Light", categoria: "Bebidas", stockActual: 35, ubicacion: "Zona B", puntoReorden: 15, capacidadMaxima: 85, demandaPromedio: 17, proveedor: "Bebidas Peru", ultimoMovimiento: "Entrada 8 und. hoy" },
  { id: "inv-9", nombre: "Desinfectante Multiuso", categoria: "Limpieza", stockActual: 21, ubicacion: "Zona A", puntoReorden: 12, capacidadMaxima: 70, demandaPromedio: 10, proveedor: "LimpiaPro", ultimoMovimiento: "Salida 3 und. hoy" },
  { id: "inv-10", nombre: "Mouse Inalámbrico", categoria: "Electrónica", stockActual: 17, ubicacion: "Zona C", puntoReorden: 10, capacidadMaxima: 50, demandaPromedio: 8, proveedor: "TecNova", ultimoMovimiento: "Entrada 6 und. hace 4h" },
  { id: "inv-11", nombre: "Toallas Industriales", categoria: "Textiles", stockActual: 40, ubicacion: "Zona B", puntoReorden: 20, capacidadMaxima: 80, demandaPromedio: 9, proveedor: "TextiMax", ultimoMovimiento: "Salida 4 und. hoy" },
  { id: "inv-12", nombre: "Leche Evaporada", categoria: "Alimentos", stockActual: 31, ubicacion: "Zona A", puntoReorden: 18, capacidadMaxima: 95, demandaPromedio: 13, proveedor: "Lácteos Andinos", ultimoMovimiento: "Entrada 7 und. mañana" },
  { id: "inv-13", nombre: "Café Premium", categoria: "Bebidas", stockActual: 19, ubicacion: "Zona B", puntoReorden: 15, capacidadMaxima: 60, demandaPromedio: 11, proveedor: "Café Sur", ultimoMovimiento: "Salida 2 und. hoy" },
  { id: "inv-14", nombre: "Papel Higiénico", categoria: "Limpieza", stockActual: 44, ubicacion: "Zona A", puntoReorden: 20, capacidadMaxima: 100, demandaPromedio: 15, proveedor: "Higienix", ultimoMovimiento: "Entrada 12 und. hoy" },
  { id: "inv-15", nombre: "Cables HDMI", categoria: "Electrónica", stockActual: 13, ubicacion: "Zona C", puntoReorden: 10, capacidadMaxima: 55, demandaPromedio: 7, proveedor: "ConectaNet", ultimoMovimiento: "Salida 3 und. ayer" },
  { id: "inv-16", nombre: "Delantales", categoria: "Textiles", stockActual: 24, ubicacion: "Zona B", puntoReorden: 16, capacidadMaxima: 75, demandaPromedio: 8, proveedor: "WorkWear", ultimoMovimiento: "Entrada 5 und. hoy" },
  { id: "inv-17", nombre: "Lentejas", categoria: "Alimentos", stockActual: 26, ubicacion: "Zona A", puntoReorden: 18, capacidadMaxima: 80, demandaPromedio: 10, proveedor: "Granos del Norte", ultimoMovimiento: "Salida 4 und. hoy" },
  { id: "inv-18", nombre: "Jugo de Naranja", categoria: "Bebidas", stockActual: 11, ubicacion: "Zona B", puntoReorden: 14, capacidadMaxima: 70, demandaPromedio: 12, proveedor: "FreshBox", ultimoMovimiento: "Salida 5 und. hoy" },
  { id: "inv-19", nombre: "Escoba Industrial", categoria: "Limpieza", stockActual: 9, ubicacion: "Zona C", puntoReorden: 12, capacidadMaxima: 60, demandaPromedio: 6, proveedor: "MopTech", ultimoMovimiento: "Salida 2 und. hoy" },
  { id: "inv-20", nombre: "Parlantes Bluetooth", categoria: "Electrónica", stockActual: 7, ubicacion: "Zona C", puntoReorden: 8, capacidadMaxima: 45, demandaPromedio: 5, proveedor: "AudioHub", ultimoMovimiento: "Entrada 4 und. hoy" },
  { id: "inv-21", nombre: "Cascos de Protección", categoria: "Textiles", stockActual: 18, ubicacion: "Zona B", puntoReorden: 10, capacidadMaxima: 65, demandaPromedio: 6, proveedor: "SegurTec", ultimoMovimiento: "Entrada 6 und. ayer" },
  { id: "inv-22", nombre: "Harina de Trigo", categoria: "Alimentos", stockActual: 34, ubicacion: "Zona A", puntoReorden: 22, capacidadMaxima: 90, demandaPromedio: 9, proveedor: "Molinos Sur", ultimoMovimiento: "Entrada 9 und. hoy" },
  { id: "inv-23", nombre: "Agua Mineral", categoria: "Bebidas", stockActual: 29, ubicacion: "Zona B", puntoReorden: 16, capacidadMaxima: 80, demandaPromedio: 13, proveedor: "AquaFlow", ultimoMovimiento: "Entrada 11 und. hoy" },
  { id: "inv-24", nombre: "Jabón Líquido", categoria: "Limpieza", stockActual: 15, ubicacion: "Zona A", puntoReorden: 12, capacidadMaxima: 65, demandaPromedio: 8, proveedor: "CleanTech", ultimoMovimiento: "Salida 2 und. ayer" },
  { id: "inv-25", nombre: "Tablets de Control", categoria: "Electrónica", stockActual: 6, ubicacion: "Zona C", puntoReorden: 8, capacidadMaxima: 40, demandaPromedio: 6, proveedor: "TechCore", ultimoMovimiento: "Entrada 3 und. hoy" },
];

export const mockMovimientos: Movimiento[] = [
  { id: "mov-1", idItem: "inv-1", fecha: "2026-05-01", tipoMovimiento: "Entrada", cantidad: 20 },
  { id: "mov-2", idItem: "inv-1", fecha: "2026-05-04", tipoMovimiento: "Salida", cantidad: 8 },
  { id: "mov-3", idItem: "inv-2", fecha: "2026-05-02", tipoMovimiento: "Entrada", cantidad: 10 },
  { id: "mov-4", idItem: "inv-4", fecha: "2026-05-06", tipoMovimiento: "Salida", cantidad: 6 },
  { id: "mov-5", idItem: "inv-5", fecha: "2026-05-07", tipoMovimiento: "Entrada", cantidad: 15 },
  { id: "mov-6", idItem: "inv-6", fecha: "2026-06-03", tipoMovimiento: "Salida", cantidad: 7 },
  { id: "mov-7", idItem: "inv-7", fecha: "2026-06-04", tipoMovimiento: "Entrada", cantidad: 12 },
  { id: "mov-8", idItem: "inv-8", fecha: "2026-06-06", tipoMovimiento: "Salida", cantidad: 5 },
  { id: "mov-9", idItem: "inv-10", fecha: "2026-06-08", tipoMovimiento: "Entrada", cantidad: 9 },
  { id: "mov-10", idItem: "inv-11", fecha: "2026-06-10", tipoMovimiento: "Salida", cantidad: 4 },
  { id: "mov-11", idItem: "inv-12", fecha: "2026-07-01", tipoMovimiento: "Entrada", cantidad: 16 },
  { id: "mov-12", idItem: "inv-13", fecha: "2026-07-02", tipoMovimiento: "Salida", cantidad: 3 },
  { id: "mov-13", idItem: "inv-14", fecha: "2026-07-03", tipoMovimiento: "Entrada", cantidad: 14 },
  { id: "mov-14", idItem: "inv-15", fecha: "2026-07-05", tipoMovimiento: "Salida", cantidad: 4 },
  { id: "mov-15", idItem: "inv-16", fecha: "2026-07-06", tipoMovimiento: "Entrada", cantidad: 8 },
  { id: "mov-16", idItem: "inv-17", fecha: "2026-07-08", tipoMovimiento: "Salida", cantidad: 5 },
  { id: "mov-17", idItem: "inv-18", fecha: "2026-07-09", tipoMovimiento: "Entrada", cantidad: 10 },
  { id: "mov-18", idItem: "inv-19", fecha: "2026-07-10", tipoMovimiento: "Salida", cantidad: 2 },
  { id: "mov-19", idItem: "inv-20", fecha: "2026-07-11", tipoMovimiento: "Entrada", cantidad: 7 },
  { id: "mov-20", idItem: "inv-21", fecha: "2026-07-12", tipoMovimiento: "Salida", cantidad: 3 },
  { id: "mov-21", idItem: "inv-22", fecha: "2026-07-13", tipoMovimiento: "Entrada", cantidad: 11 },
  { id: "mov-22", idItem: "inv-23", fecha: "2026-07-14", tipoMovimiento: "Salida", cantidad: 6 },
  { id: "mov-23", idItem: "inv-24", fecha: "2026-07-15", tipoMovimiento: "Entrada", cantidad: 9 },
  { id: "mov-24", idItem: "inv-25", fecha: "2026-07-16", tipoMovimiento: "Salida", cantidad: 4 },
];

export const mockProyectos: Proyecto[] = [
  { id: "proj-1", nombre: "Campaña de Verano", descripcion: "Aprovisionamiento rápido para operaciones externas", fechaInicio: "2026-06-01", fechaFin: "2026-08-31", estado: "En curso" },
  { id: "proj-2", nombre: "Auditoría QA", descripcion: "Validación de calidad de insumos y embalajes", fechaInicio: "2026-07-01", fechaFin: "2026-07-15", estado: "Planeado" },
  { id: "proj-3", nombre: "Reorden de Zona C", descripcion: "Redistribución de stock para reducción de tiempos", fechaInicio: "2026-07-10", fechaFin: "2026-07-20", estado: "En curso" },
  { id: "proj-4", nombre: "Plan de Reabastecimiento", descripcion: "Cobertura de inventario para el próximo trimestre", fechaInicio: "2026-07-20", fechaFin: "2026-08-20", estado: "Planeado" },
];

export const mockQaRegistros: QaRegistro[] = [
  { id: "qa-1", idItem: "inv-1", idProyecto: "proj-1", fecha: "2026-07-08", estadoQa: "Aprobado", observacion: "Cumple estándar de calidad" },
  { id: "qa-2", idItem: "inv-4", idProyecto: "proj-2", fecha: "2026-07-09", estadoQa: "En Revisión", observacion: "Revisar condición de embalaje y cableado" },
  { id: "qa-3", idItem: "inv-2", idProyecto: "proj-1", fecha: "2026-07-10", estadoQa: "Rechazado", observacion: "Stock insuficiente para la demanda de campaña" },
  { id: "qa-4", idItem: "inv-6", idProyecto: "proj-3", fecha: "2026-07-10", estadoQa: "Aprobado", observacion: "Cumple con seguridad y trazabilidad" },
  { id: "qa-5", idItem: "inv-18", idProyecto: "proj-4", fecha: "2026-07-12", estadoQa: "En Revisión", observacion: "Validar caducidad y lote" },
];

export const mockAlertas: Alerta[] = [
  { id: "alert-1", idItem: "inv-2", fecha: "2026-07-10", nivelAlerta: "Rojo", mensaje: "Stock por debajo del punto de reorden", accionSugerida: "Reabastecer 20 unidades", responsable: "Carlos Vega", area: "Operaciones" },
  { id: "alert-2", idItem: "inv-4", fecha: "2026-07-09", nivelAlerta: "Amarillo", mensaje: "Demanda creciente en la próxima semana", accionSugerida: "Mover stock desde Zona B", responsable: "Ana Torres", area: "Inventario" },
  { id: "alert-3", idItem: "inv-5", fecha: "2026-07-08", nivelAlerta: "Verde", mensaje: "Nivel estable", accionSugerida: "Mantener control", responsable: "Luis Paredes", area: "Logística" },
  { id: "alert-4", idItem: "inv-6", fecha: "2026-07-10", nivelAlerta: "Amarillo", mensaje: "Poca disponibilidad para turno de noche", accionSugerida: "Confirmar despacho urgente", responsable: "Marta Ruiz", area: "Seguridad" },
  { id: "alert-5", idItem: "inv-20", fecha: "2026-07-11", nivelAlerta: "Rojo", mensaje: "Bajo stock de audio para campañas", accionSugerida: "Solicitar compra urgente", responsable: "Paola Díaz", area: "Tecnología" },
];

export const mockRecomendaciones: Recomendacion[] = [
  { id: "rec-1", idItem: "inv-4", fecha: "2026-07-09", ubicacionSugerida: "Zona B", razon: "Mayor rotación en esa zona", impacto: "Reduce tiempos de despacho" },
  { id: "rec-2", idItem: "inv-2", fecha: "2026-07-10", ubicacionSugerida: "Zona A", razon: "Mejor proximidad a operaciones", impacto: "Mejora cobertura de turno mañan" },
  { id: "rec-3", idItem: "inv-6", fecha: "2026-07-10", ubicacionSugerida: "Zona C", razon: "Alta demanda en turnos nocturnos", impacto: "Evita paradas operativas" },
  { id: "rec-4", idItem: "inv-20", fecha: "2026-07-11", ubicacionSugerida: "Zona B", razon: "Mayor demanda en operaciones de campo", impacto: "Mejora soporte de campaña" },
];

export const mockOperarios: Operario[] = [
  { id: "op-1", nombre: "Carlos Vega", turno: "Mañana", area: "Operaciones", especialidad: "Despacho", estado: "Disponible", tareasAsignadas: 3 },
  { id: "op-2", nombre: "Ana Torres", turno: "Tarde", area: "Inventario", especialidad: "Control de stock", estado: "En ruta", tareasAsignadas: 2 },
  { id: "op-3", nombre: "Luis Paredes", turno: "Noche", area: "Logística", especialidad: "Reabastecimiento", estado: "Disponible", tareasAsignadas: 4 },
  { id: "op-4", nombre: "Marta Ruiz", turno: "Mañana", area: "Seguridad", especialidad: "Auditoría", estado: "En mantenimiento", tareasAsignadas: 1 },
  { id: "op-5", nombre: "Paola Díaz", turno: "Tarde", area: "Tecnología", especialidad: "Monitoreo", estado: "Disponible", tareasAsignadas: 2 },
];

export const mockTareas: Tarea[] = [
  { id: "task-1", titulo: "Revisar stock de agua", descripcion: "Confirmar reabastecimiento antes del turno de la tarde", estado: "Pendiente", prioridad: "Alta", asignadoA: "Ana Torres", area: "Inventario", fechaLimite: "2026-07-10", progreso: 45 },
  { id: "task-2", titulo: "Etiquetar cargadores USB-C", descripcion: "Preparar lote para auditoría QA", estado: "En progreso", prioridad: "Media", asignadoA: "Carlos Vega", area: "Operaciones", fechaLimite: "2026-07-11", progreso: 70 },
  { id: "task-3", titulo: "Actualizar ruta de distribución", descripcion: "Ajustar recorrido por zona C", estado: "Bloqueada", prioridad: "Alta", asignadoA: "Luis Paredes", area: "Logística", fechaLimite: "2026-07-10", progreso: 25 },
  { id: "task-4", titulo: "Verificar guantes de seguridad", descripcion: "Validar lote para turno nocturno", estado: "Completada", prioridad: "Baja", asignadoA: "Marta Ruiz", area: "Seguridad", fechaLimite: "2026-07-09", progreso: 100 },
  { id: "task-5", titulo: "Auditar aceite vegetal", descripcion: "Confirmar lote y calidad de entrada", estado: "Pendiente", prioridad: "Media", asignadoA: "Paola Díaz", area: "Calidad", fechaLimite: "2026-07-12", progreso: 30 },
  { id: "task-6", titulo: "Reubicar café premium", descripcion: "Mover stock a zona A para despachos rápidos", estado: "En progreso", prioridad: "Alta", asignadoA: "Carlos Vega", area: "Inventario", fechaLimite: "2026-07-12", progreso: 55 },
  { id: "task-7", titulo: "Revisar papel higiénico", descripcion: "Verificar disponibilidad para próxima semana", estado: "Pendiente", prioridad: "Media", asignadoA: "Ana Torres", area: "Logística", fechaLimite: "2026-07-13", progreso: 20 },
  { id: "task-8", titulo: "Actualizar lista de proveedores", descripcion: "Validar contactos de abastecimiento", estado: "Completada", prioridad: "Baja", asignadoA: "Marta Ruiz", area: "Compras", fechaLimite: "2026-07-08", progreso: 100 },
  { id: "task-9", titulo: "Escanear cargadores USB-C", descripcion: "Registrar inventario físico", estado: "En progreso", prioridad: "Alta", asignadoA: "Luis Paredes", area: "Operaciones", fechaLimite: "2026-07-14", progreso: 60 },
  { id: "task-10", titulo: "Coordinar turno nocturno", descripcion: "Ajustar personal por demanda", estado: "Pendiente", prioridad: "Alta", asignadoA: "Paola Díaz", area: "Seguridad", fechaLimite: "2026-07-15", progreso: 35 },
  { id: "task-11", titulo: "Revisar desinfectante multiuso", descripcion: "Validar stock para limpieza", estado: "Pendiente", prioridad: "Media", asignadoA: "Ana Torres", area: "Limpieza", fechaLimite: "2026-07-16", progreso: 25 },
  { id: "task-12", titulo: "Etiquetar lentes de seguridad", descripcion: "Separar lote para auditoría", estado: "Completada", prioridad: "Baja", asignadoA: "Carlos Vega", area: "Seguridad", fechaLimite: "2026-07-09", progreso: 100 },
  { id: "task-13", titulo: "Actualizar ruta de campaña", descripcion: "Optimizar entregas para Zona C", estado: "En progreso", prioridad: "Alta", asignadoA: "Luis Paredes", area: "Operaciones", fechaLimite: "2026-07-17", progreso: 50 },
  { id: "task-14", titulo: "Controlar cajas de agua", descripcion: "Confirmar disponibilidad de 20 unidades", estado: "Pendiente", prioridad: "Alta", asignadoA: "Marta Ruiz", area: "Inventario", fechaLimite: "2026-07-18", progreso: 40 },
  { id: "task-15", titulo: "Registrar devoluciones", descripcion: "Actualizar salidas y devoluciones del día", estado: "Completada", prioridad: "Media", asignadoA: "Paola Díaz", area: "Logística", fechaLimite: "2026-07-11", progreso: 100 },
  { id: "task-16", titulo: "Inspeccionar guantes", descripcion: "Verificar calidad antes de despacho", estado: "En progreso", prioridad: "Alta", asignadoA: "Ana Torres", area: "Calidad", fechaLimite: "2026-07-19", progreso: 65 },
  { id: "task-17", titulo: "Revisar tablets de control", descripcion: "Validar estado de batería", estado: "Pendiente", prioridad: "Media", asignadoA: "Carlos Vega", area: "Tecnología", fechaLimite: "2026-07-20", progreso: 30 },
  { id: "task-18", titulo: "Ajustar plan de reabastecimiento", descripcion: "Incorporar productos críticos al cronograma", estado: "En progreso", prioridad: "Alta", asignadoA: "Luis Paredes", area: "Compras", fechaLimite: "2026-07-21", progreso: 75 },
  { id: "task-19", titulo: "Organizar cajas de alimentos", descripcion: "Separar lote para envío mañana", estado: "Pendiente", prioridad: "Media", asignadoA: "Marta Ruiz", area: "Operaciones", fechaLimite: "2026-07-22", progreso: 15 },
  { id: "task-20", titulo: "Verificar jabones líquidos", descripcion: "Confirmar stock en zona A", estado: "Completada", prioridad: "Baja", asignadoA: "Paola Díaz", area: "Limpieza", fechaLimite: "2026-07-10", progreso: 100 },
  { id: "task-21", titulo: "Revisar pars de audio", descripcion: "Validar funcionamiento antes de campaña", estado: "En progreso", prioridad: "Media", asignadoA: "Carlos Vega", area: "Tecnología", fechaLimite: "2026-07-23", progreso: 55 },
  { id: "task-22", titulo: "Reabastecer zonal de bebidas", descripcion: "Enviar agua y jugos a turno tarde", estado: "Pendiente", prioridad: "Alta", asignadoA: "Ana Torres", area: "Inventario", fechaLimite: "2026-07-24", progreso: 20 },
  { id: "task-23", titulo: "Confirmar entregas de textiles", descripcion: "Comunicar disponibilidad de uniformes", estado: "Completada", prioridad: "Media", asignadoA: "Luis Paredes", area: "Logística", fechaLimite: "2026-07-12", progreso: 100 },
  { id: "task-24", titulo: "Auditar baterías de tablets", descripcion: "Revisar estado de carga", estado: "Pendiente", prioridad: "Alta", asignadoA: "Marta Ruiz", area: "Tecnología", fechaLimite: "2026-07-25", progreso: 28 },
  { id: "task-25", titulo: "Preparar informe semanal", descripcion: "Resumen de stock, metas y KPIs", estado: "En progreso", prioridad: "Media", asignadoA: "Paola Díaz", area: "Gerencia", fechaLimite: "2026-07-26", progreso: 70 },
];
