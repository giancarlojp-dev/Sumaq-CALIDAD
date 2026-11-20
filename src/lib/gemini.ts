import { buildLocalBoardAnalysis } from "@/lib/operational-context";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function generateGeminiBoardResponse(board: any, question?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildLocalBoardAnalysis(board, question);
  }

  const boardSummary = {
    title: board.title,
    members: board.members?.map((member: any) => member.name || member.email || "Sin nombre"),
    columns: board.columns?.map((column: any) => ({
      title: column.title,
      taskCount: column.tasks?.length ?? 0,
      tasks: column.tasks?.map((task: any) => ({
        title: task.title,
        priority: task.priority,
        assignees: task.assignees?.map((assignee: any) => assignee.name || assignee.email || "Sin nombre"),
        deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : null,
        url: task.url || null,
        description: task.description || null,
      })) ?? [],
    })) ?? [],
  };

  const userQuestion = question?.trim() ? question.trim() : "Genera un análisis general del tablero y su estado.";

  const prompt = `Eres un asistente experto en gestión de proyectos. Con base en los datos del tablero, responde a la siguiente pregunta en español de forma clara y concreta:

Pregunta: ${userQuestion}

A continuación van los datos del tablero:
${JSON.stringify(boardSummary, null, 2)}

Responde como un analista de proyectos, indicando prioridades, riesgos y recomendaciones cuando sea útil.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );
  try {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const analysis =
      data?.candidates?.[0]?.content?.[0]?.text ||
      data?.candidates?.[0]?.content?.find((item: any) => item?.text)?.text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.text ||
      JSON.stringify(data);

    return analysis;
  } catch (err: any) {
    // Log full error server-side for debugging
    console.error("[GEMINI_ERROR]", err);
    // Produce a short, user-friendly note (no raw JSON dump)
    const shortMsg = err?.message ? String(err.message).split("\n")[0] : "error desconocido";
    const local = buildLocalBoardAnalysis(board, question);
    return `${local}\n\n[Nota: Gemini no respondió correctamente (${shortMsg}). Se devolvió análisis local en su lugar.]`;
  }
}
