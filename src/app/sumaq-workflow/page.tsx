import { DashboardOverview } from "@/components/ai/DashboardOverview";
import { PredictionPanel } from "@/components/ai/PredictionPanel";
import { AlertsPanel } from "@/components/ai/AlertsPanel";
import { ChatbotModal } from "@/components/ai/ChatbotModal";

export default function SumaqWorkflowPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Sumaq Workflow</p>
          <h1 className="mt-2 text-3xl font-bold">Panel inteligente de inventario y operaciones</h1>
          <p className="mt-2 text-sm text-slate-600">Recomendaciones de reubicación, predicción de demanda y alertas operativas.</p>
        </div>

        <DashboardOverview />
        <PredictionPanel />
        <AlertsPanel />
        <ChatbotModal />
      </div>
    </main>
  );
}
