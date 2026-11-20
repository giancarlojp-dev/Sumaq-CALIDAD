import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Importamos el proveedor que acabamos de crear
import SessionAuthProvider from "@/components/providers/SessionAuthProvider";
// 2. Importamos el Toaster para las notificaciones (toast.success, etc.)
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sumaq Workflow",
  description: "Sistema de Gestión Sumaq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        {/* 3. Envolvemos toda la app con el Proveedor de Sesión */}
        <SessionAuthProvider>
          {children}
          {/* 4. Colocamos el Toaster aquí para que funcione en todas las páginas */}
          <Toaster position="top-right" richColors />
        </SessionAuthProvider>
      </body>
    </html>
  );
}