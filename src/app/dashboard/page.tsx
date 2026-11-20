import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth-utils";
import { DashboardOverview } from "@/components/ai/DashboardOverview";
import { PredictionPanel } from "@/components/ai/PredictionPanel";
import { AlertsPanel } from "@/components/ai/AlertsPanel";
import { ChatbotModal } from "@/components/ai/ChatbotModal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Sumaq Workflow</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Panel inteligente de inventario y operaciones</h1>
        <p className="mt-2 text-sm text-slate-600">Bienvenido, {session.user?.name?.split(" ")[0] || "Usuario"}. Aquí verás alertas, predicciones y recomendaciones de IA.</p>
      </div>

      <DashboardOverview />
      <PredictionPanel />
      <AlertsPanel />
      <ChatbotModal />
    </div>
  );
}