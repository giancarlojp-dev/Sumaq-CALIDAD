import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth-utils";

export async function DELETE(req: Request) {
  try {
    const session = await getAppSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Verificar Admin
    const user = await db.user.findUnique({ where: { email: session.user.email! } });
    if (user?.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

    const body = await req.json();
    const { userId, month, year } = body; // Recibimos: "Lui", 2 (Marzo), 2026

    if (!userId || month === undefined || !year) {
        return new NextResponse("Faltan datos", { status: 400 });
    }

    // 2. Calcular fechas exactas (Inicio y Fin del mes)
    // Nota: En JS los meses van de 0 (Enero) a 11 (Diciembre)
    const startDate = new Date(year, month, 1); 
    const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Último día del mes

    // 3. Ejecutar Borrado Masivo
    const result = await db.attendance.deleteMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    return new NextResponse("Error interno", { status: 500 });
  }
}