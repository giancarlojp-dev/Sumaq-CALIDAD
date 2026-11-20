// Componente base: Un rectángulo gris que parpadea
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
  );
}

// Componente Compuesto: La estructura de tu Dashboard
export function DashboardSkeleton() {
  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Falso (Título y Botones) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" /> {/* Título */}
          <Skeleton className="h-4 w-48 bg-slate-100" /> {/* Subtítulo */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" /> {/* Botón Acción */}
        </div>
      </div>

      {/* 2. Tarjetas de Resumen (KPIs) */}
      <div className="grid md:grid-cols-3 gap-6">
         {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
               <div className="flex justify-between">
                 <Skeleton className="h-5 w-24 bg-slate-100" />
                 <Skeleton className="h-8 w-8 rounded-full" />
               </div>
               <Skeleton className="h-10 w-16" />
            </div>
         ))}
      </div>
      
      {/* 3. Área Principal (Tabla o Calendario) */}
      <div className="flex gap-6 h-96">
         {/* Columna Izquierda (Lista) */}
         <div className="w-1/3 bg-white border border-slate-200 rounded-xl p-4 space-y-4 hidden md:block">
             <Skeleton className="h-6 w-1/2 mb-4" />
             {[1, 2, 3, 4, 5].map((i) => (
                 <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/2" />
                    </div>
                 </div>
             ))}
         </div>

         {/* Columna Derecha (Detalle grande) */}
         <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
             <div className="flex justify-between">
                <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 py-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
             </div>
             <Skeleton className="h-64 w-full bg-slate-50 rounded-lg" />
         </div>
      </div>
    </div>
  );
}