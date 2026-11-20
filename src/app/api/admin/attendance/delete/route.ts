import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth-utils";

export async function DELETE(req: Request) {
  try {
    const session = await getAppSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Verificar si es ADMIN (Solo el jefe puede borrar)
    const adminUser = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { recordId } = body;

    // 2. Eliminar el registro
    await db.attendance.delete({
      where: { id: recordId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error al eliminar", { status: 500 });
  }
}