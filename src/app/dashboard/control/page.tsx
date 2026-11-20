"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Calendar, Download, AlertTriangle, Search, FilterX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  id: string;
  type: "ENTRADA" | "SALIDA";
  timestamp: string;
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  attendance: AttendanceRecord[];
}

export default function ControlPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch (error) { toast.error("Error cargando datos"); } 
    finally { setLoading(false); }
  };

  const exportToExcel = () => {
    if (!selectedUser) return;
    const recordsToExport = selectedUser.attendance.filter(record => {
        const d = new Date(record.timestamp);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    if (recordsToExport.length === 0) {
        toast.warning("No hay registros para exportar.");
        return;
    }

    const data = recordsToExport.map(r => ({
        Fecha: new Date(r.timestamp).toLocaleDateString('es-PE'),
        Hora: new Date(r.timestamp).toLocaleTimeString('es-PE'),
        Tipo: r.type,
        Usuario: selectedUser.name
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");
    XLSX.writeFile(workbook, `Asistencia_${selectedUser.name}.xlsx`);
    toast.success("Descarga iniciada");
  };

  const clearMonthData = async () => {
    if (!selectedUser) return;
    if (!confirm(`⚠️ ¿Borrar TODO ${selectedMonth + 1}/${selectedYear} de ${selectedUser.name}?`)) return;

    try {
        const res = await fetch("/api/admin/attendance/clear-month", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser.id, month: selectedMonth, year: selectedYear }),
        });
        if (res.ok) {
            toast.success("Mes limpiado");
            fetchUsers();
            setSelectedUser(null);
        }
    } catch (error) { console.error(error); }
  };

  // 👇 FUNCIÓN RECUPERADA: Eliminar un solo registro
  const deleteRecord = async (recordId: string) => {
    if(!confirm("¿Eliminar este registro individual? El usuario podrá volver a marcar.")) return;
    
    try {
        const res = await fetch("/api/admin/attendance/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recordId }),
        });

        if (res.ok) {
            toast.success("Registro eliminado");
            // Actualizamos la lista localmente para no recargar todo
            if (selectedUser) {
                const updatedAttendance = selectedUser.attendance.filter(r => r.id !== recordId);
                setSelectedUser({ ...selectedUser, attendance: updatedAttendance });
                
                // También actualizamos la lista general
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, attendance: updatedAttendance } : u));
            }
        } else {
            toast.error("Error al eliminar");
        }
    } catch (error) { toast.error("Error de conexión"); }
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const displayedAttendance = selectedUser?.attendance.filter(record => {
      const d = new Date(record.timestamp);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                Gestión de Personal <Badge variant="secondary">Admin</Badge>
            </h1>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
         <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-slate-600 text-sm">
                Colaboradores ({filteredUsers.length})
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                {filteredUsers.map(user => (
                    <div 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 hover:bg-slate-100
                            ${selectedUser?.id === user.id ? "bg-blue-50 ring-1 ring-blue-200" : ""}
                        `}
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>US</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-medium text-slate-800 text-sm truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {selectedUser ? (
                <>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={selectedUser.image} />
                                <AvatarFallback>US</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{selectedUser.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    
                                    {/* 👇 SELECTORES CORREGIDOS (Color oscuro forzado) */}
                                    <select 
                                        value={selectedMonth} 
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className="text-sm bg-white text-slate-900 font-medium border border-slate-200 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        {Array.from({length: 12}, (_, i) => (
                                            <option key={i} value={i} className="text-slate-900 bg-white">
                                                {new Date(0, i).toLocaleString('es', {month: 'long'})}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <select 
                                        value={selectedYear} 
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="text-sm bg-white text-slate-900 font-medium border border-slate-200 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value={2026} className="text-slate-900">2026</option>
                                        <option value={2027} className="text-slate-900">2027</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                             <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                                <Download size={16} /> Exportar
                            </button>
                             <button onClick={clearMonthData} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                                <FilterX size={16} /> Limpiar Mes
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                        {displayedAttendance.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                <Calendar className="h-10 w-10 opacity-20" />
                                <p>No hay registros este mes.</p>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Día</th>
                                            <th className="px-4 py-3">Hora Marca</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displayedAttendance.map((record) => {
                                            const dateObj = new Date(record.timestamp);
                                            return (
                                                <tr key={record.id} className="hover:bg-slate-50 group transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-700">
                                                        {dateObj.toLocaleDateString('es-PE')}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 capitalize">
                                                        {dateObj.toLocaleDateString('es-PE', { weekday: 'long' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-slate-600">
                                                        {dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                            ${record.type === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                        `}>
                                                            {record.type}
                                                        </span>
                                                    </td>
                                                    {/* 👇 BOTÓN ELIMINAR REGISTRO INDIVIDUAL */}
                                                    <td className="px-4 py-3 text-right">
                                                       <button 
                                                            onClick={() => deleteRecord(record.id)}
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                                                            title="Eliminar este registro (Corrección)"
                                                       >
                                                            <Trash2 size={16} />
                                                       </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Users className="h-16 w-16 mb-4 opacity-10" />
                    <p>Selecciona un colaborador.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}