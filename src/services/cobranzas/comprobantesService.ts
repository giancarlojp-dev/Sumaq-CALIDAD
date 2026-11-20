import { DominioError } from "@/lib/cobranzas/errores";
import { formatearNumeroComprobante } from "@/lib/cobranzas/dominio";
import { ContextoServicio, EmitirComprobanteInput } from "./tipos";

export class ComprobantesService {
  /**
   * Emite comprobante dentro de prisma.$transaction con incremento atómico de correlativo
   */
  static async emitirComprobante(input: EmitirComprobanteInput, ctx: ContextoServicio) {
    if (ctx.usuario.rol === "AUDITOR") {
      throw new DominioError("ACCESO_DENEGADO", "El rol AUDITOR no tiene permisos para emitir facturas.", 403);
    }

    if (!input.pagoId) {
      throw new DominioError("DATOS_INVALIDOS", "El pagoId es obligatorio.", 400);
    }

    const serie = input.serie || "F001";

    const comprobante = await ctx.prisma.$transaction(async (tx) => {
      // 1. Verificar existencia del pago y relaciones
      const pago = await tx.pago.findUnique({
        where: { id: input.pagoId },
        include: {
          cuota: {
            include: { cliente: true },
          },
          comprobante: true,
        },
      });

      if (!pago) {
        throw new DominioError("PAGO_NO_ENCONTRADO", "El pago especificado no existe.", 404);
      }

      // Control a nivel de objeto para COBRANZAS
      if (ctx.usuario.rol === "COBRANZAS" && pago.cuota.cliente.responsableId !== ctx.usuario.id) {
        throw new DominioError("PAGO_NO_ENCONTRADO", "El pago especificado no existe.", 404);
      }

      // 2. Verificar que no haya sido facturado previamente
      if (pago.comprobante) {
        throw new DominioError("PAGO_YA_FACTURADO", "Este pago ya cuenta con un comprobante emitido.", 409);
      }

      // 3. Obtener e incrementar correlativo de la serie atómicamente
      const serieRegistro = await tx.serieComprobante.upsert({
        where: { serie },
        update: {
          ultimoNumero: { increment: 1 },
        },
        create: {
          serie,
          ultimoNumero: 1,
        },
      });

      const numeroCorrelativo = serieRegistro.ultimoNumero;
      const hoy = ctx.ahora();

      // 4. Crear el comprobante
      const nuevoComprobante = await tx.comprobante.create({
        data: {
          pagoId: pago.id,
          serie,
          numero: numeroCorrelativo,
          montoTotal: pago.monto,
          emitidoEn: hoy,
          emitidoPorId: ctx.usuario.id,
          estado: "EMITIDO",
        },
      });

      return {
        ...nuevoComprobante,
        numeroCompleto: formatearNumeroComprobante(serie, numeroCorrelativo),
      };
    });

    return comprobante;
  }

  /**
   * Obtiene un comprobante por ID con control de acceso por cliente
   */
  static async obtenerPorId(id: string, ctx: ContextoServicio) {
    const comprobante = await ctx.prisma.comprobante.findUnique({
      where: { id },
      include: {
        pago: {
          include: {
            cuota: {
              include: { cliente: true },
            },
          },
        },
      },
    });

    if (!comprobante) {
      throw new DominioError("COMPROBANTE_NO_ENCONTRADO", "Comprobante no encontrado.", 404);
    }

    // Si es COBRANZAS, no revelar existencia si el cliente no es suyo
    if (ctx.usuario.rol === "COBRANZAS" && comprobante.pago.cuota.cliente.responsableId !== ctx.usuario.id) {
      throw new DominioError("COMPROBANTE_NO_ENCONTRADO", "Comprobante no encontrado.", 404);
    }

    return {
      id: comprobante.id,
      pagoId: comprobante.pagoId,
      serie: comprobante.serie,
      numero: comprobante.numero,
      numeroCompleto: formatearNumeroComprobante(comprobante.serie, comprobante.numero),
      montoTotal: Number(comprobante.montoTotal),
      emitidoEn: comprobante.emitidoEn,
      emitidoPorId: comprobante.emitidoPorId,
      estado: comprobante.estado,
      pago: {
        id: comprobante.pago.id,
        monto: Number(comprobante.pago.monto),
        montoMora: Number(comprobante.pago.montoMora),
        montoCapital: Number(comprobante.pago.montoCapital),
        metodo: comprobante.pago.metodo,
        referencia: comprobante.pago.referencia,
        fechaPago: comprobante.pago.fechaPago,
        cuota: {
          id: comprobante.pago.cuota.id,
          numero: comprobante.pago.cuota.numero,
          concepto: comprobante.pago.cuota.concepto,
          cliente: {
            id: comprobante.pago.cuota.cliente.id,
            nombre: comprobante.pago.cuota.cliente.nombre,
            documento: comprobante.pago.cuota.cliente.documento,
          },
        },
      },
    };
  }
}
