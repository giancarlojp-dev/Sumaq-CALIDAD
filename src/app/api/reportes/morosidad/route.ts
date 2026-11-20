import { NextResponse } from "next/server";
import { exigirRol, exigirSesion } from "@/lib/cobranzas/autorizacion";
import { DominioError } from "@/lib/cobranzas/errores";
import { ReportesService } from "@/services/cobranzas/reportesService";
import { crearContextoPorDefecto } from "@/services/cobranzas/contexto";

export async function GET() {
  try {
    const usuario = await exigirSesion();
    exigirRol(usuario, ["ADMIN", "COBRANZAS", "AUDITOR"]);

    const ctx = crearContextoPorDefecto(usuario);
    const reporte = await ReportesService.reporteMorosidad(ctx);

    return NextResponse.json(reporte, { status: 200 });
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
