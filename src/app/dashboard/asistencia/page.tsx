import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth-utils";
import { Clock, CalendarCheck } from "lucide-react";
import AttendanceButton from "@/components/attendance/AttendanceButton";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar"; 

export const dynamic = "force-dynamic";

export default async function AsistenciaPage() {
  const session = await getAppSession();
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  // 1. Obtener registros de HOY
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logsToday = await db.attendance.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startOfDay }
    },
    orderBy: { timestamp: 'desc' }
  });
  
  // --- NUEVA LÓGICA DE VERIFICACIÓN ---
  // Revisamos si en la lista de hoy ya existe una Entrada o una Salida
  const yaMarcoEntrada = logsToday.some((log: { type: string }) => log.type === "ENTRADA");
  const yaMarcoSalida = logsToday.some((log: { type: string }) => log.type === "SALIDA");

  // 2. Obtener días trabajados (para el calendario)
  const allLogs = await db.attendance.findMany({
    where: { userId: session.user.id },
    select: { date: true }
  });
  
  const workedDays = allLogs.map((log: { date: Date }) => log.date);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 rounded-lg">
           <Clock className="h-6 w-6 text-red-600" />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Control de Asistencia</h1>
           <p className="text-slate-500">Registra y visualiza tu actividad laboral</p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Fichaje */}
        <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-2">Registrar Actividad</h3>
                <div className="text-center py-6 bg-slate-50 rounded-xl mb-6 border border-slate-100">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Hora del Servidor (Lima)</p>
                    
                    <p className="text-4xl font-mono font-bold text-slate-800">
                        {new Date().toLocaleTimeString('es-PE', {
                            timeZone: 'America/Lima',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </p>
                </div>
                
                {/* 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE: Pasamos las variables al botón */}
                <AttendanceButton 
                    yaMarcoEntrada={yaMarcoEntrada} 
                    yaMarcoSalida={yaMarcoSalida} 
                />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-4 text-sm">Movimientos de Hoy</h3>
                <div className="space-y-3">
                    {logsToday.length === 0 ? (
                        <p className="text-slate-400 text-sm italic text-center py-2">Sin registros hoy.</p>
                    ) : logsToday.map((log: { id: string; type: string; timestamp: Date }) => (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${log.type === 'ENTRADA' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-medium text-slate-700 text-sm">{log.type}</span>
                            </div>
                            
                            <span className="font-mono text-slate-500 text-xs">
                                {log.timestamp.toLocaleTimeString('es-PE', {
                                    timeZone: 'America/Lima',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: Calendario */}
        <div className="md:col-span-7">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <CalendarCheck className="text-blue-600 h-5 w-5" />
                    <h3 className="font-semibold text-slate-700">Historial Mensual</h3>
                </div>
                <div className="flex-1 flex justify-center items-start">
                    <AttendanceCalendar workedDays={workedDays} />
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600"></span> Días Laborados
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-200"></span> Ausente / FDS
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}