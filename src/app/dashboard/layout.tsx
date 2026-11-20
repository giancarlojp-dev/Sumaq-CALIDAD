import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image"; 
import { Toaster } from "sonner"; 
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth-utils";

import {
  Layout,
  CalendarCheck,
  Settings,
  LogOut,
  Menu,
  Bell,
  Home,
  UserCircle,
  ShieldCheck // Icono para el panel de Control
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sumaq System | Tableros",
  description: "Gestión operativa interna",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A. PROTECCIÓN Y DATOS DE SESIÓN
  const session = await getAppSession();
  
  if (!session || !session.user?.email) {
    redirect("/api/auth/signin");
  }

  const isAdmin = session.user?.email === "luicxz.09.11@gmail.com";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* === NOTIFICACIONES (TOASTER) === */}
      <Toaster richColors position="top-right" />

      {/* === SIDEBAR (Barra Lateral) === */}
      <aside className="w-64 bg-slate-900 text-white flex-col shadow-xl z-20 hidden md:flex">

        {/* C. LOGO OFICIAL DE SUMAQ */}
        <div className="h-20 flex items-center gap-2 px-6 border-b border-slate-800">
          <div className="relative w-10 h-10 shrink-0">
             <Image 
               src="/logo-sf.png" 
               alt="Sumaq Logo" 
               fill 
               className="object-contain"
               priority
             />
          </div>
          <span className="font-bold text-lg tracking-wide text-slate-100">
            SUMAQ WORKFLOW
          </span>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

          <p className="text-xs text-slate-500 font-semibold uppercase px-4 mb-2">
            Principal
          </p>

          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <Home className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Inicio</span>
          </Link>

          <p className="text-xs text-slate-500 font-semibold uppercase px-4 mb-2 mt-6">
            Espacio de Trabajo
          </p>

          <Link href="/dashboard/tableros" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <Layout className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Tableros & Proyectos</span>
          </Link>

          <Link href="/dashboard/asistencia" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <CalendarCheck className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Mi Asistencia</span>
          </Link>

          {/* D. BOTÓN EXCLUSIVO PARA ADMINISTRADORES (Sr. Ciriaco) */}
          {isAdmin && (
            <>
              <p className="text-xs text-amber-600 font-semibold uppercase px-4 mb-2 mt-6">
                Gerencia
              </p>
              <Link href="/dashboard/control" className="flex items-center gap-3 px-4 py-3 text-amber-100 bg-amber-900/20 border border-amber-900/50 hover:bg-amber-900/40 hover:text-white rounded-lg transition-colors group">
                <ShieldCheck className="h-5 w-5 text-amber-500 group-hover:text-amber-400 transition-colors" />
                <span className="font-bold text-amber-500 group-hover:text-amber-400">Control & RRHH</span>
              </Link>
            </>
          )}

          <p className="text-xs text-slate-500 font-semibold uppercase px-4 mb-2 mt-6">
            Sistema
          </p>

          <Link href="/dashboard/configuracion" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <Settings className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Configuración</span>
          </Link>
        </nav>

        {/* E. PERFIL DE USUARIO REAL (Footer Sidebar) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            
            {/* Avatar del Usuario */}
            <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600 relative">
              {session.user.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <UserCircle />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white">
                {session.user.name?.split(" ")[0]} 
              </p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-bold">
                {/* Mostramos el Rol Real obtenido de la BD */}
                {isAdmin ? "ADMIN" : "COLABORADOR"}
              </p>
            </div>
            
            {/* Botón Salir */}
            <Link href="/api/auth/signout" title="Cerrar Sesión">
               <LogOut className="h-4 w-4 text-slate-500 hover:text-red-400 transition-colors" />
            </Link>
          </div>
        </div>
      </aside>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-slate-100 rounded-full">
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 relative hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-600 rounded-full border border-white animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Área de renderizado de páginas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}