"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryCategories, mockInventory } from "@/lib/mock-ai-data";
import { aiService } from "@/services/aiService";

type PredictionData = {
  categoria: string;
  volumenEstimado: number;
  diasFuturo: number;
};

export function PredictionPanel() {
  const [categoria, setCategoria] = useState<(typeof inventoryCategories)[number]>("Alimentos");
  const [dias, setDias] = useState(30);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const [newName, setNewName] = useState("");
  const [newDemanda, setNewDemanda] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newPunto, setNewPunto] = useState("");

  const loadPrediction = useCallback(async () => {
    setIsGenerating(true);
    try {
      const data = await aiService.predecirDemanda(categoria, dias);
      setPrediction(data);
    } catch {
      setPrediction(null);
    } finally {
      setIsGenerating(false);
    }
  }, [categoria, dias]);

  useEffect(() => {
    void loadPrediction();
  }, [loadPrediction, dataVersion]);

  const forecast = useMemo(() => {
    const baseValue = prediction?.volumenEstimado ?? 24;
    const raw = [
      Math.max(10, baseValue - 8),
      Math.max(12, baseValue - 4),
      Math.max(14, baseValue - 1),
      baseValue + 2,
      baseValue + 5,
      baseValue + 7,
      baseValue + 10,
    ];
    return raw.map((v) => Number(v));
  }, [prediction]);

  // Debugging aid: show numeric values in console and render pixel heights
  const showDebug = true;

  // We include `dataVersion` intentionally to force recompute when inventory is mutated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const itemsCategoria = useMemo(() => mockInventory.filter((item) => item.categoria === categoria), [categoria, dataVersion]);

  const handleAddItem = async () => {
    if (!newName || !newDemanda) return;

    await aiService.addInventoryItem({
      nombre: newName,
      categoria,
      demandaPromedio: Number(newDemanda),
      stockActual: Number(newStock) || 0,
      puntoReorden: Number(newPunto) || 10,
    });

    setDataVersion((v) => v + 1);
    setNewName("");
    setNewDemanda("");
    setNewStock("");
    setNewPunto("");

    // refresh prediction with new data
    void loadPrediction();
  };

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      {/* Decorative top banner (purely esthetic) */}
      <div className="w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 p-3 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Sumaq · Insights</div>
            <div className="text-xs opacity-90">Panel de predicciones — visión rápida</div>
          </div>
          <div className="text-right text-xs opacity-90">Actualizado automáticamente</div>
        </div>
      </div>

      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Panel de predicciones</CardTitle>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value as (typeof inventoryCategories)[number])}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            {inventoryCategories.map((option) => (
              <option key={option} value={option} className="bg-white text-slate-900">
                {option}
              </option>
            ))}
          </select>
          <select
            value={dias}
            onChange={(event) => setDias(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value={30} className="bg-white text-slate-900">
              30 días
            </option>
            <option value={45} className="bg-white text-slate-900">
              45 días
            </option>
            <option value={60} className="bg-white text-slate-900">
              60 días
            </option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main decorative summary bar (purely esthetic) */}
        <div className="rounded-xl bg-white/60 border border-slate-100 p-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">PD</div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Predicción</div>
              <div className="text-xs text-slate-500">Categoría: {categoria} · {dias} días</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">Confianza estimada: <span className="font-semibold">Alta</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void aiService.predecirDemanda(categoria, dias).then(setPrediction);
            }}
            disabled={isGenerating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? "Generando..." : "Generar pronóstico"}
          </button>
          <div className="text-sm text-slate-500">Último pronóstico: {prediction ? `${prediction.volumenEstimado} und.` : "-"}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Pronóstico de demanda</p>
            <p className="text-xs text-slate-500">Vista semanal</p>
          </div>

          {/* Chart with Y axis and bars (bigger scale) */}
          <div className="flex gap-4 items-stretch">
            {/* Y axis labels */}
            {(() => {
              const maxForecast = Math.max(...forecast, prediction?.volumenEstimado ?? 1);
              const roundedMax = Math.ceil(maxForecast / 10) * 10 || 10;
              const step = Math.ceil(roundedMax / 4);
              const ticks = [0, step, step * 2, step * 3, roundedMax];
              return (
                <div className="w-14 flex flex-col justify-between h-96 text-sm text-slate-500">
                  {ticks.slice().reverse().map((t) => (
                    <div key={t} className="flex items-center justify-end pr-2">{t}</div>
                  ))}
                </div>
              );
            })()}

            <div className="flex-1">
              <div className="relative">
                {/* horizontal grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ top: `${(i / 4) * 100}%` }} className="absolute left-0 right-0 border-t border-slate-100" />
                  ))}
                </div>

                <div className="h-96 flex items-end gap-4 px-2">
                  {(() => {
                    const maxForecast = Math.max(...forecast, prediction?.volumenEstimado ?? 1);
                    const roundedMax = Math.ceil(maxForecast / 10) * 10 || 10;
                    const areaHeightPx = 320; // px max height for bars
                    if (showDebug) console.table({ forecast, roundedMax, areaHeightPx });
                    return forecast.map((value, index) => {
                      const numeric = Number(value);
                      // compute pixel height to avoid percent rounding issues
                      const heightPx = Math.max(6, Math.round((numeric / roundedMax) * areaHeightPx));
                      if (showDebug) console.log(`W${index + 1}`, { numeric, heightPx, roundedMax });
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="text-sm font-semibold text-slate-800 mb-1">{numeric}</div>
                          <div className="w-10/12 flex items-end">
                            <div
                              className="w-full rounded-lg shadow-lg flex items-end justify-center text-white text-sm font-bold border border-slate-200"
                              style={{
                                height: `${heightPx}px`,
                                background: "linear-gradient(180deg,#0ea5e9,#0369a1)",
                                transition: "height 300ms ease",
                                minHeight: 6,
                              }}
                              aria-label={`W${index + 1} ${numeric}`}
                            >
                              <div className="pb-1">{numeric}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-center text-sm text-slate-500">W{index + 1}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {prediction && (
          <div className="rounded-xl border border-red-100 bg-red-50/70 p-3">
            <p className="text-sm font-semibold text-slate-800">
              Volumen estimado para {prediction.categoria}: {prediction.volumenEstimado} unidades en {prediction.diasFuturo} días.
            </p>
            <p className="mt-1 text-sm text-slate-600">La tendencia muestra una demanda estable para esta categoría en el siguiente periodo.</p>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-700">Ítems de la categoría</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {itemsCategoria.map((item) => (
              <span key={item.id} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
                {item.nombre} · {item.stockActual} und.
              </span>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500 mb-2">Agregar ítem a esta categoría (se actualiza la IA automáticamente)</p>
            <div className="flex flex-wrap gap-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" className="rounded-md border px-2 py-1 text-sm" />
              <input value={newDemanda} onChange={(e) => setNewDemanda(e.target.value)} placeholder="Demanda promedio" className="w-36 rounded-md border px-2 py-1 text-sm" />
              <input value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="Stock actual" className="w-28 rounded-md border px-2 py-1 text-sm" />
              <input value={newPunto} onChange={(e) => setNewPunto(e.target.value)} placeholder="Punto reorden" className="w-28 rounded-md border px-2 py-1 text-sm" />
              <button onClick={handleAddItem} className="rounded-md bg-green-600 px-3 py-1 text-sm text-white">Agregar ítem</button>
            </div>
          </div>
        </div>
      </CardContent>
      {/* Footer (estético) */}
      <div className="w-full bg-gradient-to-t from-slate-50 to-white border-t border-slate-100 p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <div>© {new Date().getFullYear()} Sumaq · Sistema Inteligente</div>
          <div className="flex items-center gap-4">
            <a className="text-sky-600 hover:underline" href="#">Ayuda</a>
            <a className="text-sky-600 hover:underline" href="#">Configuración</a>
          </div>
        </div>
      </div>
    </Card>
  );
}
