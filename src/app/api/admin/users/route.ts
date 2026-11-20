import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const session = await getAppSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Verificar si es ADMIN
    const adminUser = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. Obtener todos los usuarios
    const users = await db.user.findMany({
      orderBy: { name: 'asc' },
      include: {
        attendance: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse("Error interno", { status: 500 });
  }
}