import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppSession } from "@/lib/auth-utils";

export async function PATCH(req: Request) {
  const session = await getAppSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    // SI ES VISITANTE -> ¡FUERA! 🛑
    if (!user || user.role === "VISITOR") {
      return new NextResponse("No tienes permisos para editar tareas.", { status: 403 });
    }
    
  // 👇 1. Recibimos url y assigneeIds desde el modal
  const { taskId, title, description, priority, deadline, url, assigneeIds } = await req.json();

  if (!taskId) return new NextResponse("Falta ID", { status: 400 });

  try {
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        
        // 👇 2. Guardamos la URL actualizada
        url: url || null, 
        
        // 👇 3. Actualizamos la lista de responsables
        assignees: {
          // 'set' borra los anteriores y pone solo los que están en la nueva lista
          set: assigneeIds && assigneeIds.length > 0 
            ? assigneeIds.map((id: string) => ({ id })) 
            : []
        }
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[TASK_UPDATE_ERROR]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}