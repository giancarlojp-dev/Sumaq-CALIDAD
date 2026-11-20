import { DominioError } from "@/lib/cobranzas/errores";
import { aplicarPago, calcularMora, calcularSaldo, diasDeAtraso } from "@/lib/cobranzas/dominio";
import { ContextoServicio, RegistrarPagoInput } from "./tipos";
import { Prisma } from "@prisma/client";

export class PagosService {
  /**
   * Registra un pago dentro de prisma.$transaction con soporte para Idempotency-Key
   */
  static async registrarPago(input: RegistrarPagoInput, ctx: ContextoServicio) {
    if (ctx.usuario.rol === "AUDITOR") {
      throw new DominioError("ACCESO_DENEGADO", "El rol AUDITOR no tiene permisos de escritura.", 403);
    }

    if (!input.cuotaId || input.monto === undefined || !input.metodo) {
      throw new DominioError("DATOS_INVALIDOS", "cuotaId, monto y metodo son obligatorios.", 400);
    }

    if (typeof input.monto !== "number" || input.monto <= 0) {
      throw new DominioError("MONTO_INVALIDO", "El monto a pagar debe ser mayor a cero.", 400);
    }

    const metodosPermitidos = ["EFECTIVO", "TRANSFERENCIA", "TARJETA"];
    if (!metodosPermitidos.includes(input.metodo)) {
      throw new DominioError("METODO_INVALIDO", "Método de pago no válido.", 400);
    }

    // Manejo de idempotencia si se proporciona Idempotency-Key
    if (input.idempotencyKey) {
      const pagoPrevio = await ctx.prisma.pago.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: {
          cuota: {
            include: { cliente: true },
          },
          comprobante: true,
        },
      });

      if (pagoPrevio) {
        // Validar si el usuario tiene acceso a este pago previo
        if (ctx.usuario.rol === "COBRANZAS" && pagoPrevio.cuota.cliente.responsableId !== ctx.usuario.id) {
          throw new DominioError("CUOTA_NO_ENCONTRADA", "Cuota no encontrada.", 404);
        }
        return { pago: pagoPrevio, idempotente: true };
      }
    }

    // Ejecutar en transacción atómica
    const resultado = await ctx.prisma.$transaction(async (tx) => {
      // Releer cuota con cliente y pagos previos para evitar condiciones de carrera
      const cuota = await tx.cuota.findUnique({
        where: { id: input.cuotaId },
        include: {
          cliente: true,
          pagos: true,
        },
      });

      if (!cuota) {
        throw new DominioError("CUOTA_NO_ENCONTRADA", "La cuota especificada no existe.", 404);
      }

      // Control a nivel de objeto para COBRANZAS
      if (ctx.usuario.rol === "COBRANZAS" && cuota.cliente.responsableId !== ctx.usuario.id) {
        throw new DominioError("CUOTA_NO_ENCONTRADA", "La cuota especificada no existe.", 404);
      }

      const montoCuotaNum = Number(cuota.monto);
      const montosCapitalesPrevios = cuota.pagos.map((p) => Number(p.montoCapital));
      const saldoCapitalActual = calcularSaldo(montoCuotaNum, montosCapitalesPrevios);

      if (saldoCapitalActual <= 0) {
        throw new DominioError("CUOTA_YA_PAGADA", "La cuota ya se encuentra totalmente cancelada.", 409);
      }

      const hoy = ctx.ahora();
      const diasAtraso = diasDeAtraso(cuota.fechaVencimiento, hoy);
      const moraVigente = calcularMora(diasAtraso, saldoCapitalActual);

      const totalDeuda = Math.round((saldoCapitalActual + moraVigente) * 100) / 100;
      if (input.monto > totalDeuda + 0.001) {
        throw new DominioError(
          "MONTO_EXCEDE_ADEUDO",
          `El monto S/ ${input.monto.toFixed(2)} excede el total adeudado de S/ ${totalDeuda.toFixed(2)} (Capital: S/ ${saldoCapitalActual.toFixed(2)}, Mora: S/ ${moraVigente.toFixed(2)}).`,
          400
        );
      }

      const { aMora, aCapital } = aplicarPago(saldoCapitalActual, moraVigente, input.monto);

      const nuevoPago = await tx.pago.create({
        data: {
          cuotaId: cuota.id,
          monto: new Prisma.Decimal(input.monto.toFixed(2)),
          montoMora: new Prisma.Decimal(aMora.toFixed(2)),
          montoCapital: new Prisma.Decimal(aCapital.toFixed(2)),
          metodo: input.metodo,
          referencia: input.referencia ? input.referencia.trim() : null,
          idempotencyKey: input.idempotencyKey ? input.idempotencyKey.trim() : null,
          registradoPorId: ctx.usuario.id,
          fechaPago: hoy,
        },
        include: {
          cuota: {
            include: { cliente: true },
          },
        },
      });

      return nuevoPago;
    });

    return { pago: resultado, idempotente: false };
  }
}
