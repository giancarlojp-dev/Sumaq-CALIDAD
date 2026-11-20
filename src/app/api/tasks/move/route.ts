// src/app/api/tasks/move/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  // 1. Verificar seguridad (¿Quién eres?)
  const session = await getAppSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    // SI ES VISITANTE -> ¡FUERA! 🛑
    if (!user || user.role === "VISITOR") {
      return new NextResponse("No tienes permisos para crear tareas.", { status: 403 });
    }

  // 2. Leer los datos que manda el tablero
  const { taskId, newColumnId, newOrder } = await req.json();

  try {
    // 3. Actualizar la tarea en Supabase
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        columnId: newColumnId,  // Cambiamos de columna (ej. de "Por Contactar" a "Negociación")
        // order: newOrder,     // (Opcional por ahora: guardamos el orden visual)
      },
    });

    console.log(`✅ Tarea movida: ${updatedTask.id} -> Columna ${newColumnId}`);
    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error("[TASK_MOVE_ERROR]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}