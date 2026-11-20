import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth-utils"; // Importamos nuestro guardia

export async function PATCH(req: Request) {
  try {
    // 👇 AQUÍ ESTÁ LA MAGIA: 1 sola línea para validar todo
    const adminUser = await getCurrentAdmin();

    if (!adminUser) {
      return new NextResponse("No autorizado o sin permisos", { status: 403 });
    }

    // --- A partir de aquí, la lógica es la misma de antes ---
    const body = await req.json();
    const { userId, role, department, jobTitle } = body;

    // Validación extra (Opcional pero recomendada): Evitar que un Admin se quite el rol a sí mismo
    if (userId === adminUser.id && role !== "ADMIN") {
        return new NextResponse("No puedes quitarte tu propio rol de Admin", { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        role: role,
        department: department, 
        jobTitle: jobTitle      
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error al guardar:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}