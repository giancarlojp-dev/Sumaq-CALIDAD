/**
 * Dominio puro de cobranzas y facturación.
 * Regla: No importa Prisma, Next.js ni lee reloj de sistema.
 * Moneda: PEN (Soles). Redondeo a 2 decimales.
 */

export interface OpcionesEstadoCuota {
  fechaVencimiento?: Date | string;
  hoy?: Date | string;
}

/**
 * Calcula la mora según días de atraso y monto base.
 * Mora = montoBase * 0.005 * diasAtraso, con tope al 20% de montoBase.
 */
export function calcularMora(diasAtraso: number, montoBase: number): number {
  if (
    typeof diasAtraso !== "number" ||
    typeof montoBase !== "number" ||
    Number.isNaN(diasAtraso) ||
    Number.isNaN(montoBase)
  ) {
    throw new TypeError("diasAtraso y montoBase deben ser valores numéricos.");
  }
  if (montoBase <= 0) {
    throw new RangeError("montoBase debe ser un valor positivo mayor a cero.");
  }
  if (diasAtraso < 0) {
    throw new RangeError("diasAtraso no puede ser un valor negativo.");
  }
  if (diasAtraso === 0) {
    return 0;
  }

  const moraCalculada = Math.round(montoBase * 0.005 * diasAtraso * 100) / 100;
  const topeMora = Math.round(montoBase * 0.2 * 100) / 100;

  return Math.min(moraCalculada, topeMora);
}

/**
 * Calcula el saldo restante de una cuota restando los pagos acumulados.
 * Devuelve max(montoCuota - suma(pagos), 0) con 2 decimales.
 */
export function calcularSaldo(
  montoCuota: number,
  pagos: number[] = [],
): number {
  if (typeof montoCuota !== "number" || Number.isNaN(montoCuota)) {
    throw new TypeError("montoCuota debe ser numérico.");
  }

  const sumaPagos = pagos.reduce((acc, p) => {
    if (typeof p !== "number" || Number.isNaN(p)) {
      throw new TypeError("Cada pago debe ser numérico.");
    }
    return acc + p;
  }, 0);

  const saldo = Math.max(0, montoCuota - sumaPagos);
  return Math.round(saldo * 100) / 100;
}

/**
 * Determina días calendario desde la fecha de vencimiento hasta hoy en UTC-5 (America/Lima).
 * Sin periodo de gracia: el día siguiente al vencimiento cuenta como 1 día de atraso.
 */
export function diasDeAtraso(
  fechaVencimiento: Date | string,
  hoy: Date | string,
): number {
  const parseFecha = (fecha: Date | string): Date => {
    const d =
      typeof fecha === "string" ? new Date(fecha) : new Date(fecha.getTime());
    return d;
  };

  // fechaVencimiento is a database DATE, so its UTC calendar components are authoritative.
  const vencimiento = parseFecha(fechaVencimiento);
  const msVencimiento = Date.UTC(
    vencimiento.getUTCFullYear(),
    vencimiento.getUTCMonth(),
    vencimiento.getUTCDate(),
  );

  const hoyLima = new Date(parseFecha(hoy).getTime() - 5 * 60 * 60 * 1000);
  const msHoy = Date.UTC(
    hoyLima.getUTCFullYear(),
    hoyLima.getUTCMonth(),
    hoyLima.getUTCDate(),
  );

  if (msHoy <= msVencimiento) {
    return 0;
  }

  const unDiaMs = 24 * 60 * 60 * 1000;
  return Math.floor((msHoy - msVencimiento) / unDiaMs);
}

/**
 * Evalúa el estado de una cuota: 'pagada', 'vencida', 'parcial' o 'pendiente'.
 * Precedencia:
 * 1. Saldo igual a 0 -> 'pagada'.
 * 2. Si no, con opciones (fechaVencimiento y hoy): vencimiento anterior a hoy -> 'vencida'.
 * 3. Si no, si hay pagos -> 'parcial'.
 * 4. Si no -> 'pendiente'.
 */
export function estadoCuota(
  montoCuota: number,
  pagos: number[] = [],
  opciones?: OpcionesEstadoCuota,
): "pagada" | "vencida" | "parcial" | "pendiente" {
  const saldo = calcularSaldo(montoCuota, pagos);
  if (saldo === 0) {
    return "pagada";
  }

  if (opciones?.fechaVencimiento && opciones?.hoy) {
    const atraso = diasDeAtraso(opciones.fechaVencimiento, opciones.hoy);
    if (atraso > 0) {
      return "vencida";
    }
  }

  const sumaPagos = pagos.reduce((acc, p) => acc + p, 0);
  if (sumaPagos > 0) {
    return "parcial";
  }

  return "pendiente";
}

/**
 * Imputa el pago primero a la mora y el excedente al saldo capital.
 * Devuelve { aMora, aCapital }.
 * Lanza RangeError si monto <= 0 o si supera (saldoCapital + moraVigente).
 */
export function aplicarPago(
  saldoCapital: number,
  moraVigente: number,
  monto: number,
): { aMora: number; aCapital: number } {
  if (typeof monto !== "number" || Number.isNaN(monto) || monto <= 0) {
    throw new RangeError("El monto a pagar debe ser mayor a cero.");
  }

  const totalAdeudado = Math.round((saldoCapital + moraVigente) * 100) / 100;
  if (monto > totalAdeudado + 0.001) {
    throw new RangeError("El monto a pagar excede el total adeudado.");
  }

  const aMora = Math.round(Math.min(monto, moraVigente) * 100) / 100;
  const aCapital = Math.round((monto - aMora) * 100) / 100;

  return { aMora, aCapital };
}

/**
 * Formatea número correlativo con serie: serie + '-' + número con 8 dígitos.
 * Ejemplo: ('F001', 1) -> 'F001-00000001'.
 */
export function formatearNumeroComprobante(
  serie: string,
  numero: number,
): string {
  const pad = String(numero).padStart(8, "0");
  return `${serie}-${pad}`;
}
