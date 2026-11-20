"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiService } from "@/services/aiService";
import type { Alerta } from "@/types/ai";

export function AlertsPanel() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useEffect(() => {
    const load = async () => {
      const resumen = await aiService.obtenerResumen();
      setAlertas(resumen.alertas);
    };
    load();
  }, []);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Alertas activas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Ítem</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => (
                <tr key={alerta.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{alerta.idItem}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${alerta.nivelAlerta === "Rojo" ? "bg-red-100 text-red-700" : alerta.nivelAlerta === "Amarillo" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {alerta.nivelAlerta}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{alerta.area || "Operaciones"}</td>
                  <td className="px-4 py-3 text-slate-600">{alerta.responsable || "Sin asignar"}</td>
                  <td className="px-4 py-3 text-slate-600">{alerta.accionSugerida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
