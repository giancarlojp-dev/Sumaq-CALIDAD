"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MoveRight, ClipboardList, Users, PackageCheck, Boxes, BarChart3 } from "lucide-react";
import { aiService } from "@/services/aiService";
import type { Alerta, InventoryItem, Movimiento, Operario, Recomendacion, Tarea } from "@/types/ai";

export function DashboardOverview() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [operarios, setOperarios] = useState<Operario[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const resumen = await aiService.obtenerResumen();
      setAlertas(resumen.alertas);
      setRecomendaciones(resumen.recomendaciones);
      setOperarios(resumen.operarios);
      setTareas(resumen.tareas);
      setInventario(resumen.inventario);
      setMovimientos(resumen.movimientos);
      setLoading(false);
    };
    load();
  }, []);

  const kpis = useMemo(() => {
    const criticas = alertas.filter((item) => item.nivelAlerta === "Rojo").length;
    const healthy = alertas.filter((item) => item.nivelAlerta === "Verde").length;
    const tareasUrgentes = tareas.filter((item) => item.prioridad === "Alta" || item.estado === "Pendiente").length;
    const operariosActivos = operarios.filter((item) => item.estado === "Disponible").length;
    const productosCriticos = inventario.filter((item) => item.stockActual <= item.puntoReorden).length;
    const stockTotal = inventario.reduce((total, item) => total + item.stockActual, 0);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const movimientosMes = movimientos.filter((item) => item.fecha.startsWith(currentMonth)).reduce((total, item) => total + item.cantidad, 0);

    return [
      { title: "Alertas activas", value: alertas.length, color: "text-red-600", icon: AlertTriangle },
      { title: "Tareas urgentes", value: tareasUrgentes, color: "text-amber-600", icon: ClipboardList },
      { title: "Operarios disponibles", value: operariosActivos, color: "text-emerald-600", icon: Users },
      { title: "Stock total", value: stockTotal, color: "text-slate-800", icon: Boxes },
      { title: "Productos críticos", value: productosCriticos, color: "text-orange-600", icon: PackageCheck },
      { title: "Movimientos del mes", value: movimientosMes, color: "text-blue-600", icon: BarChart3 },
    ];
  }, [alertas, inventario, movimientos, operarios, tareas]);

  const inventarioCritico = useMemo(() => {
    return alertas.filter((item) => item.nivelAlerta === "Rojo" || item.nivelAlerta === "Amarillo").slice(0, 4);
  }, [alertas]);

  const tareasPrioritarias = useMemo(() => tareas.slice(0, 4), [tareas]);

  const metricasMensuales = useMemo(() => {
    const grouped = new Map<string, { entradas: number; salidas: number }>();
    movimientos.forEach((movimiento) => {
      const [year, month] = movimiento.fecha.split("-");
      const key = `${year}-${month}`;
      const current = grouped.get(key) ?? { entradas: 0, salidas: 0 };
      if (movimiento.tipoMovimiento === "Entrada") current.entradas += movimiento.cantidad;
      else current.salidas += movimiento.cantidad;
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4)
      .map(([key, values]) => ({
        etiqueta: new Date(Number(key.split("-")[0]), Number(key.split("-")[1]) - 1, 1).toLocaleDateString("es-PE", { month: "short", year: "numeric" }),
        entradas: values.entradas,
        salidas: values.salidas,
      }));
  }, [movimientos]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">{kpi.title}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{loading ? "--" : kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle>Resumen operativo del día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Prioridad actual</p>
              <p className="mt-2 text-sm text-slate-600">El foco de hoy está en reabastecer agua, revisar cargadores USB-C, cubrir inventario crítico y preparar el resumen semanal para gerencia.</p>
            </div>
            <div className="space-y-3">
              {tareasPrioritarias.map((task) => (
                <div key={task.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{task.titulo}</p>
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">{task.prioridad}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{task.descripcion}</p>
                  <p className="mt-2 text-xs text-slate-500">Asignado a {task.asignadoA} · {task.fechaLimite}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle>Inventario crítico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventarioCritico.map((alerta) => (
              <div key={alerta.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{alerta.idItem}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${alerta.nivelAlerta === "Rojo" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{alerta.nivelAlerta}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{alerta.mensaje}</p>
                <p className="mt-2 text-xs text-slate-500">Responsable: {alerta.responsable || "Por asignar"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle>Métricas mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metricasMensuales.map((item) => (
              <div key={item.etiqueta} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-700">{item.etiqueta}</p>
                <p className="mt-2 text-sm text-emerald-600">Entradas: {item.entradas}</p>
                <p className="text-sm text-rose-600">Salidas: {item.salidas}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle>Recomendaciones de reubicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendaciones.map((recommendation) => (
              <div key={recommendation.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{recommendation.idItem}</p>
                  <p className="text-sm text-slate-600">{recommendation.razon}</p>
                  {recommendation.impacto && <p className="text-xs text-slate-500">{recommendation.impacto}</p>}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  {recommendation.ubicacionSugerida} <MoveRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
