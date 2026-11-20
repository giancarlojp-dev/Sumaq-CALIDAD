// src/app/api/tasks/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppSession } from "@/lib/auth-utils";

export async function DELETE(req: Request) {
  const session = await getAppSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    // SI ES VISITANTE -> ¡FUERA! 🛑
    if (!user || user.role === "VISITOR") {
      return new NextResponse("No tienes permisos para crear tareas.", { status: 403 });
    }
    
  const { taskId } = await req.json();

  if (!taskId) {
    return new NextResponse("Falta ID de tarea", { status: 400 });
  }

  try {
    const deletedTask = await db.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json(deletedTask);

  } catch (error) {
    console.error("[TASK_DELETE_ERROR]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}