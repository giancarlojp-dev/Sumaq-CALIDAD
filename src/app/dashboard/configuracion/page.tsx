"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
// 👇 1. Importamos SWR
import useSWR from "swr"; 
import { User, Shield, Mail, Briefcase, Building2, Save, X, PenLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeletons";

interface UserData {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "ADMIN" | "COLLABORATOR" | "VISITOR";
  department?: string;
  jobTitle?: string;
}

// 👇 2. Función "fetcher" (El mensajero que trae los datos)
// SWR la usa automáticamente cada vez que necesita actualizar
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  
  // 👇 3. REEMPLAZAMOS useEffect y useState POR useSWR
  // - data: Aquí están tus usuarios (ya no necesitas setAllUsers)
  // - isLoading: Automáticamente true o false
  // - mutate: La varita mágica para recargar los datos sin F5
  const { data: allUsers = [], isLoading, mutate } = useSWR<UserData[]>("/api/admin/users", fetcher);

  // Solo necesitamos estado para la edición manual y el usuario actual
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Calculamos el usuario actual en tiempo real basado en la data de SWR
  const currentUserData = allUsers.find(u => u.email === session?.user?.email);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Guardamos referencia por si falla
    const previousUsers = allUsers;

    // ⚡ OPTIMISTIC UI: Actualizamos la interfaz INMEDIATAMENTE antes de que el servidor responda
    // Le decimos a SWR: "Haz de cuenta que la lista ya es esta"
    mutate(
        allUsers.map(u => u.id === editingUser.id ? editingUser : u),
        false // false = "No revalides todavía, confía en mí"
    );

    setEditingUser(null);
    toast.loading("Guardando cambios...");

    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          role: editingUser.role,
          department: editingUser.department,
          jobTitle: editingUser.jobTitle
        }),
      });

      if (res.ok) {
        toast.dismiss();
        toast.success("Ficha actualizada");
        // 👇 Confirmamos los datos reales con el servidor
        mutate(); 
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error al guardar");
      // Si falló, deshacemos el cambio optimista
      mutate(previousUsers, false);
    }
  };

  if (isLoading) return <div className="p-10 text-slate-400">Cargando datos en tiempo real...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 relative">
      
      {/* === 1. MI FOTOCHECK DIGITAL === */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group">
        <div className="bg-linear-to-r from-slate-900 to-slate-800 h-32 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-start gap-6 -mt-12">
            <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="text-4xl bg-slate-100 text-slate-400">YO</AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-sm 
                    ${currentUserData?.role === 'ADMIN' ? 'bg-purple-500' : 
                      currentUserData?.role === 'COLLABORATOR' ? 'bg-blue-500' : 'bg-amber-500'}
                `} title={`Rol: ${currentUserData?.role}`}></div>
            </div>
            
            <div className="pt-14 flex-1 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">{currentUserData?.name || session?.user?.name}</h2>
                        <p className="text-slate-500 flex items-center gap-2 mt-1">
                            <Mail size={16} /> {currentUserData?.email || session?.user?.email}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 min-w-37.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CARGO / PUESTO</p>
                        <p className="font-semibold text-slate-700 flex items-center gap-2">
                            <Briefcase size={16} className="text-blue-600"/>
                            {currentUserData?.jobTitle || "---"}
                        </p>
                    </div>

                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 min-w-37.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ÁREA / DEPARTAMENTO</p>
                        <p className="font-semibold text-slate-700 flex items-center gap-2">
                            <Building2 size={16} className="text-orange-600"/>
                            {currentUserData?.department || "---"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* === 2. GESTIÓN DE PERSONAL (Solo Admin) === */}
      {currentUserData?.role === "ADMIN" && (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-6 flex justify-between items-end border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="text-blue-600" /> Directorio de Personal
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Edita la información de cada colaborador manualmente.
                    </p>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    Total: {allUsers.length}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Ficha Técnica</th>
                            <th className="px-6 py-4">Permisos</th>
                            <th className="px-6 py-4 text-right">Editar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {allUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {user.jobTitle ? (
                                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                <Briefcase size={12} className="text-slate-400"/> {user.jobTitle}
                                            </span>
                                        ) : <span className="text-xs text-slate-300 italic">Sin Cargo</span>}
                                        
                                        {user.department ? (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Building2 size={12} className="text-slate-400"/> {user.department}
                                            </span>
                                        ) : <span className="text-xs text-slate-300 italic">Sin Área</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={`text-[10px] font-bold
                                        ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                          user.role === 'COLLABORATOR' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                          'bg-amber-50 text-amber-700 border-amber-200'}
                                    `}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setEditingUser(user)}
                                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                    >
                                        <PenLine size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      )}

      {/* === MODAL DE EDICIÓN === */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Editar Ficha de Personal</h3>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSaveChanges} className="p-6 space-y-5">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={editingUser.image} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-slate-700">{editingUser.name}</p>
                            <p className="text-xs text-slate-500">{editingUser.email}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">Nivel de Acceso</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                        >
                            <option value="VISITOR">🔒 Visitante</option>
                            <option value="COLLABORATOR">✏️ Colaborador</option>
                            <option value="ADMIN">🛡️ Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">Área / Departamento</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingUser.department || ""}
                                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">Cargo / Puesto</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingUser.jobTitle || ""}
                                onChange={(e) => setEditingUser({...editingUser, jobTitle: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-sm">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 text-white bg-slate-900 hover:bg-slate-800 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                            <Save size={18} /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}