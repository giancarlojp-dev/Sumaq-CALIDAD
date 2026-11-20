import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    // SI ES VISITANTE -> ¡FUERA! 🛑
    if (!user || user.role === "VISITOR") {
      return new NextResponse("No tienes permisos para crear tareas.", { status: 403 });
    }
    
    const body = await req.json();
    
    // 👇 1. Actualizamos lo que recibimos del Modal (Ahora incluye url y assigneeIds)
    const { title, columnId, priority, description, deadline, url, assigneeIds } = body; 

    // Validar datos básicos
    if (!title || !columnId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Buscar el último orden de la columna para colocar la tarea al final
    const lastTask = await db.task.findFirst({
       where: { columnId },
       orderBy: { order: 'desc' }
    });
    const newOrder = lastTask ? lastTask.order + 1 : 1;

    // 👇 2. CREAR LA TAREA (Actualizado para múltiples asignados y URL)
    const task = await db.task.create({
      data: {
        title,
        columnId,
        order: newOrder,
        priority: priority || "MEDIUM",
        description: description || "",
        deadline: deadline ? new Date(deadline) : null,
        url: url || null, // <--- GUARDAMOS LA URL AQUÍ
        assignees: {
          // <--- CONECTAMOS A TODOS LOS USUARIOS SELECCIONADOS
          connect: assigneeIds && assigneeIds.length > 0 
            ? assigneeIds.map((id: string) => ({ id })) 
            : [] 
        }
      }
    });

    return NextResponse.json(task);

  } catch (error) {
    console.log("[TASKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}