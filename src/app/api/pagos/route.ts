import { NextResponse } from "next/server";
import { exigirRol, exigirSesion } from "@/lib/cobranzas/autorizacion";
import { DominioError } from "@/lib/cobranzas/errores";
import { PagosService } from "@/services/cobranzas/pagosService";
import { crearContextoPorDefecto } from "@/services/cobranzas/contexto";

export async function POST(req: Request) {
  try {
    const usuario = await exigirSesion();
    exigirRol(usuario, ["ADMIN", "COBRANZAS"]);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: { codigo: "DATOS_INVALIDOS", mensaje: "Cuerpo de solicitud inválido." } },
        { status: 400 }
      );
    }

    // Cabecera Idempotency-Key opcional
    const idempotencyKey = req.headers.get("Idempotency-Key") || body.idempotencyKey || undefined;

    const ctx = crearContextoPorDefecto(usuario);
    const { pago, idempotente } = await PagosService.registrarPago(
      { ...body, idempotencyKey },
      ctx
    );

    const status = idempotente ? 200 : 201;
    return NextResponse.json(pago, { status });
  } catch (error) {
    if (error instanceof DominioError) {
      return NextResponse.json(
        { error: { codigo: error.codigo, mensaje: error.mensaje } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { codigo: "ERROR_INTERNO", mensaje: "Ocurrió un error inesperado." } },
      { status: 500 }
    );
  }
}
