import { DominioError } from "@/lib/cobranzas/errores";
import {
  calcularMora,
  calcularSaldo,
  diasDeAtraso,
  estadoCuota,
} from "@/lib/cobranzas/dominio";
import { ContextoServicio, CrearCuotaInput, FiltrosCuotas } from "./tipos";
import { Prisma } from "@prisma/client";

function validarDatosBasicosCuota(
  input: CrearCuotaInput,
  ctx: ContextoServicio,
) {
  if (ctx.usuario.rol !== "ADMIN") {
    throw new DominioError(
      "ACCESO_DENEGADO",
      "Solo administradores pueden crear cuotas.",
      403,
    );
  }

  if (
    !input.clienteId ||
    !input.numero ||
    !input.concepto ||
    input.monto === undefined ||
    !input.fechaVencimiento
  ) {
    throw new DominioError(
      "DATOS_INVALIDOS",
      "Todos los campos de la cuota son obligatorios.",
      400,
    );
  }
}

function validarMontoYNumeroCuota(input: CrearCuotaInput) {
  if (typeof input.monto !== "number" || input.monto <= 0) {
    throw new DominioError(
      "MONTO_INVALIDO",
      "El monto de la cuota debe ser mayor a cero.",
      400,
    );
  }

  if (input.numero <= 0 || !Number.isInteger(input.numero)) {
    throw new DominioError(
      "NUMERO_INVALIDO",
      "El número de cuota debe ser un entero positivo.",
      400,
    );
  }
}

export class CuotasService {
  /**
   * Crear nueva cuota. Requiere rol ADMIN.
   */
  static async crearCuota(input: CrearCuotaInput, ctx: ContextoServicio) {
    validarDatosBasicosCuota(input, ctx);
    validarMontoYNumeroCuota(input);

    // Verificar existencia del cliente
    const cliente = await ctx.prisma.cliente.findUnique({
      where: { id: input.clienteId },
    });

    if (!cliente) {
      throw new DominioError(
        "CLIENTE_NO_ENCONTRADO",
        "El cliente especificado no existe.",
        404,
      );
    }

    // Verificar unicidad de (clienteId, numero)
    const cuotaExistente = await ctx.prisma.cuota.findUnique({
      where: {
        clienteId_numero: {
          clienteId: input.clienteId,
          numero: input.numero,
        },
      },
    });

    if (cuotaExistente) {
      throw new DominioError(
        "CUOTA_DUPLICADA",
        `La cuota número ${input.numero} ya existe para este cliente.`,
        409,
      );
    }

    const fechaVenc = new Date(input.fechaVencimiento);
    if (Number.isNaN(fechaVenc.getTime())) {
      throw new DominioError(
        "FECHA_INVALIDA",
        "La fecha de vencimiento no es válida.",
        400,
      );
    }

    const cuota = await ctx.prisma.cuota.create({
      data: {
        clienteId: input.clienteId,
        numero: input.numero,
        concepto: input.concepto.trim(),
        monto: new Prisma.Decimal(input.monto.toFixed(2)),
        fechaVencimiento: fechaVenc,
      },
      include: {
        cliente: true,
      },
    });

    return cuota;
  }

  /**
   * Listar cuotas con filtros, paginación y cálculos al vuelo sin N+1
   */
  static async listarCuotas(filtros: FiltrosCuotas, ctx: ContextoServicio) {
    const pagina = Math.max(1, filtros.pagina || 1);
    const limite = Math.min(100, Math.max(1, filtros.limite || 20));
    const skip = (pagina - 1) * limite;

    const where: Prisma.CuotaWhereInput = {};

    // Control a nivel de objeto: COBRANZAS solo ve cuotas de clientes asignados
    if (ctx.usuario.rol === "COBRANZAS") {
      where.cliente = {
        responsableId: ctx.usuario.id,
      };
    }

    if (filtros.clienteId) {
      where.clienteId = filtros.clienteId;
    }

    // Traer cuotas con pagos incluidos en una sola consulta para evitar N+1
    const [todasLasCuotas, total] = await Promise.all([
      ctx.prisma.cuota.findMany({
        where,
        select: {
          id: true,
          clienteId: true,
          numero: true,
          concepto: true,
          monto: true,
          fechaVencimiento: true,
          creadoEn: true,
          pagos: {
            select: {
              montoCapital: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              responsableId: true,
            },
          },
        },
        orderBy: [{ fechaVencimiento: "asc" }, { numero: "asc" }],
        skip,
        take: limite,
      }),
      ctx.prisma.cuota.count({ where }),
    ]);

    const hoy = ctx.ahora();

    const cuotasConCalculos = todasLasCuotas.map((cuota) => {
      const montoCuotaNum = Number(cuota.monto);
      const montosCapitalesPagados = cuota.pagos.map((p) =>
        Number(p.montoCapital),
      );
      const saldo = calcularSaldo(montoCuotaNum, montosCapitalesPagados);
      const diasAtraso = diasDeAtraso(cuota.fechaVencimiento, hoy);
      const mora = saldo > 0 ? calcularMora(diasAtraso, saldo) : 0;
      const estado = estadoCuota(montoCuotaNum, montosCapitalesPagados, {
        fechaVencimiento: cuota.fechaVencimiento,
        hoy,
      });

      return {
        id: cuota.id,
        clienteId: cuota.clienteId,
        numero: cuota.numero,
        concepto: cuota.concepto,
        monto: montoCuotaNum,
        fechaVencimiento: cuota.fechaVencimiento,
        creadoEn: cuota.creadoEn,
        cliente: cuota.cliente,
        saldo,
        mora,
        diasAtraso,
        estado,
      };
    });

    // Filtro adicional por estado si se especificó
    const resultado = filtros.estado
      ? cuotasConCalculos.filter((c) => c.estado === filtros.estado)
      : cuotasConCalculos;

    return {
      datos: resultado,
      pagina,
      limite,
      total: filtros.estado ? resultado.length : total,
    };
  }
}
