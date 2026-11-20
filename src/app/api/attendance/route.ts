import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { type } = body; // "ENTRADA" o "SALIDA"

    // 1. Calcular el inicio del día (00:00 AM)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 2. BUSCAR SI YA EXISTE UN REGISTRO DE ESE TIPO HOY
    const existingLog = await db.attendance.findFirst({
      where: {
        userId: session.user.id,
        type: type, // Buscamos si ya hay "ENTRADA" o "SALIDA"
        date: {
          gte: startOfDay, // Mayor o igual a las 00:00 de hoy
        },
      },
    });

    // 3. SI YA EXISTE, LANZAMOS ERROR
    if (existingLog) {
      return new NextResponse(
        `Ya has registrado tu ${type.toLowerCase()} el día de hoy.`, 
        { status: 400 }
      );
    }

    // 4. Si no existe, lo creamos
    const log = await db.attendance.create({
      data: {
        type,
        userId: session.user.id,
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    return new NextResponse("Error interno", { status: 500 });
  }
}