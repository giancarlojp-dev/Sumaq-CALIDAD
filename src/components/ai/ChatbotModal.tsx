"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { aiService } from "@/services/aiService";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
}

const quickPrompts = ["¿Qué stock está crítico?", "¿Qué tareas están pendientes?", "¿Quién está disponible?", "¿Qué proyectos están activos?", "¿Qué entradas y salidas hubo este mes?", "¿Qué productos tienen más demanda?", "¿Qué riesgos operativos tengo hoy?"];

export function ChatbotModal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", content: "Hola, soy Sumaq IA. Puedo ayudarte con inventario, tareas, operarios, alertas, proyectos, QA y métricas mensuales." },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const sendPrompt = async (value: string) => {
    const text = value.trim();
    if (!text || sending) return;

    const userMessage = { id: Date.now(), role: "user" as const, content: text };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setSending(true);

    const response = await aiService.consultarChatbot(text);
    setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", content: response.respuesta }]);
    setSending(false);
  };

  const handleSend = () => sendPrompt(draft);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[360px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Asistente IA</p>
              <p className="text-xs text-slate-300">Sumaq Workflow</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-sm text-slate-300">✕</button>
          </div>
          <div className="flex h-80 flex-col gap-2 overflow-y-auto bg-slate-50 p-3">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-6 whitespace-pre-wrap ${message.role === "assistant" ? "bg-slate-900 text-slate-50" : "ml-auto bg-red-600 text-white"}`}>
                {message.content}
              </div>
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button key={prompt} onClick={() => sendPrompt(prompt)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-200 p-3">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu consulta..." className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
            <button onClick={handleSend} disabled={sending} className="rounded-lg bg-slate-900 p-2 text-white disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <MessageCircle className="h-4 w-4" /> Chat IA
        </button>
      )}
    </div>
  );
}
