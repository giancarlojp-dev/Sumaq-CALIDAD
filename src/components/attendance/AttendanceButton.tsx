"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

interface Props {
  yaMarcoEntrada: boolean;
  yaMarcoSalida: boolean;
}

export default function AttendanceButton({ yaMarcoEntrada, yaMarcoSalida }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const registrar = async (tipo: "ENTRADA" | "SALIDA") => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ type: tipo }),
      });
      
      if(res.ok) {
        toast.success(`¡${tipo} registrada con éxito!`); 
        router.refresh(); 
      } else {
        // Si el backend nos rechaza (por duplicado), mostramos el error
        const msg = await res.text();
        toast.error(msg);
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 w-full mt-4">
      
      {/* BOTÓN ENTRADA */}
      <button
        onClick={() => registrar("ENTRADA")}
        disabled={loading || yaMarcoEntrada}
        className={`flex-1 py-3 rounded-lg font-bold shadow-md transition-all 
          ${yaMarcoEntrada 
            ? "bg-slate-200 text-slate-400 cursor-not-allowed" // Estilo Desactivado
            : "bg-green-600 hover:bg-green-700 text-white hover:scale-105" // Estilo Activo
          }`}
      >
        {yaMarcoEntrada ? "ENTRADA REGISTRADA" : "MARCAR ENTRADA"}
      </button>

      {/* BOTÓN SALIDA */}
      <button
        onClick={() => registrar("SALIDA")}
        // Bloqueamos si: Ya marcó salida O (opcional) Si NO ha marcado entrada aún
        disabled={loading || yaMarcoSalida} 
        className={`flex-1 py-3 rounded-lg font-bold shadow-md transition-all 
          ${yaMarcoSalida 
            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
            : "bg-red-600 hover:bg-red-700 text-white hover:scale-105"
          }`}
      >
        {yaMarcoSalida ? "SALIDA REGISTRADA" : "MARCAR SALIDA"}
      </button>
    </div>
  );
}