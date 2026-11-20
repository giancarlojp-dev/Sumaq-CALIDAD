// src/app/page.tsx
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";
import Image from "next/image";
import { getAppSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const session = await getAppSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#151058] overflow-hidden text-black">

      {/* 🔥 LOGO GIGANTE FONDO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
       <Image
  src="/sumaq-logo.png"
  alt="Sumaq Background Logo"
  width={2200}
  height={2200}
  className="opacity-[0.25] grayscale blur-md"
/>

      </div>

      {/* 🔴 CÍRCULO ROJO */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-red-600/20 rounded-full blur-[150px] z-0" />

      {/* 🔵 CÍRCULO AZUL */}
      <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-blue-500/20 rounded-full blur-[150px] z-0" />

      {/* 💳 TARJETA LOGIN */}
      <div className="relative z-10 w-full max-w-md p-5 bg-white rounded-2xl shadow-2xl border border-black/10">

        {/* LOGO SUPERIOR */}
        <div className="text-center mb-6">
          <Image
            src="/sumaq-logo.png"
            alt="Sumaq Projects Logo"
            width={80}
            height={180}
            className="mx-auto mb-3"
          />

          <h1 className="text-2xl font-bold tracking-tight text-[#000000]
">
  SUMAQ{" "}
  <span className="bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent font-bold">
    WORKFLOW
  </span>
</h1>


          <p className="text-black/70 text-sm mt-1">
            Bienvenido al Panel de Control
          </p>
        </div>

        {/* SEPARADOR */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-black/10"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-black/40">
              Acceso Corporativo
            </span>
          </div>
        </div>

        {/* BOTÓN LOGIN */}
        <div className="flex justify-center hover:scale-105 transition-transform">
          <LoginButton />
        </div>

        {/* FOOTER */}
        <div className="pt-6 text-center text-xs text-black/50">
          © 2026 Sumaq Projects S.A.C.<br />
          Sistema de Gestión Interna v1.0
        </div>

      </div>
    </main>
  );
}
