import { calcularMora, calcularSaldo, diasDeAtraso } from "@/lib/cobranzas/dominio";
import { ContextoServicio } from "./tipos";
import { Prisma } from "@prisma/client";

export interface FilaReporteMorosidad {
  clienteId: string;
  nombre: string;
  cuotasVencidas: number;
  deudaCapital: number;
  moraTotal: number;
  deudaTotal: number;
  maxDiasAtraso: number;
}

export class ReportesService {
  /**
   * Genera el reporte de morosidad agrupado por cliente, sin duplicados
   * y ordenado por deudaTotal de forma descendente.
   */
  static async reporteMorosidad(ctx: ContextoServicio): Promise<FilaReporteMorosidad[]> {
    const whereCliente: Prisma.ClienteWhereInput = {};

    if (ctx.usuario.rol === "COBRANZAS") {
      whereCliente.responsableId = ctx.usuario.id;
    }

    // Traer todos los clientes con sus cuotas y pagos respectivos
    const clientes = await ctx.prisma.cliente.findMany({
      where: whereCliente,
      include: {
        cuotas: {
          include: {
            pagos: true,
          },
        },
      },
    });

    const hoy = ctx.ahora();
    const morosos: FilaReporteMorosidad[] = [];

    for (const cliente of clientes) {
      let cuotasVencidas = 0;
      let deudaCapital = 0;
      let moraTotal = 0;
      let maxDiasAtraso = 0;

      for (const cuota of cliente.cuotas) {
        const montoCuotaNum = Number(cuota.monto);
        const montosCapitalesPagados = cuota.pagos.map((p) => Number(p.montoCapital));
        const saldoCapital = calcularSaldo(montoCuotaNum, montosCapitalesPagados);

        if (saldoCapital > 0) {
          const atraso = diasDeAtraso(cuota.fechaVencimiento, hoy);
          if (atraso > 0) {
            cuotasVencidas++;
            deudaCapital += saldoCapital;
            const mora = calcularMora(atraso, saldoCapital);
            moraTotal += mora;
            if (atraso > maxDiasAtraso) {
              maxDiasAtraso = atraso;
            }
          }
        }
      }

      if (cuotasVencidas > 0) {
        deudaCapital = Math.round(deudaCapital * 100) / 100;
        moraTotal = Math.round(moraTotal * 100) / 100;
        const deudaTotal = Math.round((deudaCapital + moraTotal) * 100) / 100;

        morosos.push({
          clienteId: cliente.id,
          nombre: cliente.nombre,
          cuotasVencidas,
          deudaCapital,
          moraTotal,
          deudaTotal,
          maxDiasAtraso,
        });
      }
    }

    // Orden por deudaTotal descendente
    morosos.sort((a, b) => b.deudaTotal - a.deudaTotal);

    return morosos;
  }
}
