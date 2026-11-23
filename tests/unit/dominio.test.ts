import {
  calcularMora,
  calcularSaldo,
  diasDeAtraso,
  estadoCuota,
  aplicarPago,
  formatearNumeroComprobante,
} from "@/lib/cobranzas/dominio";

describe("Dominio puro - CP-01 a CP-10 y casos borde", () => {
  test("CP-01: 0 días de atraso sobre S/ 500 devuelve mora 0", () => {
    expect(calcularMora(0, 500)).toBe(0);
  });

  test("CP-02: 15 días de atraso sobre S/ 500 devuelve mora S/ 37.50", () => {
    expect(calcularMora(15, 500)).toBe(37.5);
  });

  test("CP-03: días negativos lanza RangeError", () => {
    expect(() => calcularMora(-5, 500)).toThrow(RangeError);
  });

  test("CP-04: monto base 0 lanza RangeError", () => {
    expect(() => calcularMora(10, 0)).toThrow(RangeError);
  });

  test("CP-05: 1 día de atraso sobre S/ 500 devuelve S/ 2.50", () => {
    expect(calcularMora(1, 500)).toBe(2.5);
  });

  test("CP-06: 30 días de atraso sobre S/ 500 devuelve S/ 75.00", () => {
    expect(calcularMora(30, 500)).toBe(75);
  });

  test("CP-07: 120 días de atraso sobre S/ 500 satura en tope 20% = S/ 100.00", () => {
    expect(calcularMora(120, 500)).toBe(100);
  });

  test("CP-08: tipo no numérico o NaN lanza TypeError", () => {
    expect(() => calcularMora("15" as unknown as number, 500)).toThrow(
      TypeError,
    );
    expect(() => calcularMora(Number.NaN, 500)).toThrow(TypeError);
    expect(() => calcularSaldo(Number.NaN, [])).toThrow(TypeError);
    expect(() => calcularSaldo(500, [Number.NaN])).toThrow(TypeError);
  });

  test("CP-09: saldo con pago parcial de 200 sobre cuota de 500 es 300", () => {
    expect(calcularSaldo(500, [200])).toBe(300);
  });

  test("CP-10: estado de cuota con pago total igual al monto es 'pagada'", () => {
    expect(estadoCuota(500, [500])).toBe("pagada");
  });

  test("diasDeAtraso y estadoCuota consideran vencida, parcial y pendiente", () => {
    expect(
      diasDeAtraso(
        new Date("2026-11-15T05:00:00.000Z"),
        new Date("2026-11-10T05:00:00.000Z"),
      ),
    ).toBe(0);
    expect(
      diasDeAtraso("2026-11-10T05:00:00.000Z", "2026-11-15T05:00:00.000Z"),
    ).toBe(5);
    expect(
      diasDeAtraso(
        new Date("2026-11-10T00:00:00.000Z"),
        new Date("2026-11-20T12:00:00.000Z"),
      ),
    ).toBe(10);
    expect(
      estadoCuota(500, [100], {
        fechaVencimiento: "2026-11-10T05:00:00.000Z",
        hoy: "2026-11-15T05:00:00.000Z",
      }),
    ).toBe("vencida");
    expect(
      estadoCuota(500, [100], {
        fechaVencimiento: "2026-11-25T05:00:00.000Z",
        hoy: "2026-11-15T05:00:00.000Z",
      }),
    ).toBe("parcial");
    expect(estadoCuota(500, [])).toBe("pendiente");
  });

  test("aplicarPago imputa primero a mora y luego a capital y valida límites", () => {
    expect(aplicarPago(500, 12.5, 50)).toEqual({ aMora: 12.5, aCapital: 37.5 });
    expect(() => aplicarPago(500, 12.5, 0)).toThrow(RangeError);
    expect(() => aplicarPago(500, 12.5, Number.NaN)).toThrow(RangeError);
    expect(() => aplicarPago(500, 12.5, 600)).toThrow(RangeError);
  });

  test("formatearNumeroComprobante formatea con 8 dígitos", () => {
    expect(formatearNumeroComprobante("F001", 1)).toBe("F001-00000001");
  });
});
