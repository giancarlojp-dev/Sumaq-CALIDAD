import { NextResponse } from "next/server";
import { MOCK_BOARD } from "@/data/mockData";
import { generateGeminiBoardResponse } from "@/lib/gemini";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const question = url.searchParams.get("question") || undefined;

  try {
    const analysis = await generateGeminiBoardResponse(MOCK_BOARD, question);
    // Always return JSON with analysis (even if fallback) so the client can render it
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[BOARD_ANALYSIS_ERROR]", error);
    // As a last resort, return a helpful JSON payload
    return NextResponse.json({ analysis: "No se pudo generar el análisis. Revisa la configuración del servidor." }, { status: 200 });
  }
}
