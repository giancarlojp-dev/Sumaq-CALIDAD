import { NextResponse } from "next/server";
import { exigirRol, exigirSesion } from "@/lib/cobranzas/autorizacion";
import { DominioError } from "@/lib/cobranzas/errores";
import { CuotasService } from "@/services/cobranzas/cuotasService";
import { crearContextoPorDefecto } from "@/services/cobranzas/contexto";

export async function POST(req: Request) {
  try {
    const usuario = await exigirSesion();
    exigirRol(usuario, ["ADMIN"]);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: { codigo: "DATOS_INVALIDOS", mensaje: "Cuerpo de solicitud inválido." } },
        { status: 400 }
      );
    }

    const ctx = crearContextoPorDefecto(usuario);
    const cuota = await CuotasService.crearCuota(body, ctx);

    return NextResponse.json(cuota, { status: 201 });
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

export async function GET(req: Request) {
  try {
    const usuario = await exigirSesion();
    exigirRol(usuario, ["ADMIN", "COBRANZAS", "AUDITOR"]);

    const url = new URL(req.url);
    const clienteId = url.searchParams.get("clienteId") || undefined;
    const estado = url.searchParams.get("estado") || undefined;
    const pagina = parseInt(url.searchParams.get("pagina") || "1", 10);
    const limite = parseInt(url.searchParams.get("limite") || "20", 10);

    const ctx = crearContextoPorDefecto(usuario);
    const resultado = await CuotasService.listarCuotas(
      { clienteId, estado, pagina, limite },
      ctx
    );

    return NextResponse.json(resultado, { status: 200 });
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
