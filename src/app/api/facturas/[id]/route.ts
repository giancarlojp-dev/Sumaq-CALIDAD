import { NextResponse } from "next/server";
import { exigirRol, exigirSesion } from "@/lib/cobranzas/autorizacion";
import { DominioError } from "@/lib/cobranzas/errores";
import { ComprobantesService } from "@/services/cobranzas/comprobantesService";
import { crearContextoPorDefecto } from "@/services/cobranzas/contexto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await exigirSesion();
    exigirRol(usuario, ["ADMIN", "COBRANZAS", "AUDITOR"]);

    const { id } = await params;

    const ctx = crearContextoPorDefecto(usuario);
    const comprobante = await ComprobantesService.obtenerPorId(id, ctx);

    return NextResponse.json(comprobante, { status: 200 });
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

/**
 * Los comprobantes emitidos son estrictamente inmutables.
 * Cualquier intento de modificación o borrado responde 409 COMPROBANTE_INMUTABLE (o 403 para AUDITOR).
 */
export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    void id;
    const usuario = await exigirSesion();
    if (usuario.rol === "AUDITOR") {
      return NextResponse.json(
        { error: { codigo: "ACCESO_DENEGADO", mensaje: "El rol AUDITOR no tiene permisos para modificar recursos." } },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: { codigo: "COMPROBANTE_INMUTABLE", mensaje: "Los comprobantes emitidos son inmutables y no pueden modificarse." } },
      { status: 409 }
    );
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}
