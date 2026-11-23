import { CuotasService } from "@/services/cobranzas/cuotasService";
import { PagosService } from "@/services/cobranzas/pagosService";
import { ComprobantesService } from "@/services/cobranzas/comprobantesService";
import { ReportesService } from "@/services/cobranzas/reportesService";
import { ContextoServicio } from "@/services/cobranzas/tipos";

function crearContextoMock(
  rol: string,
  prismaOverrides: Record<string, unknown> = {},
  fechaFija = new Date("2026-11-20T12:00:00.000Z"),
  userId = "user-1"
): {
  ctx: ContextoServicio;
  tx: {
    cuota: { findUnique: jest.Mock };
    pago: { create: jest.Mock; findUnique: jest.Mock };
    serieComprobante: { upsert: jest.Mock };
    comprobante: { create: jest.Mock };
  };
} {
  const tx = {
    cuota: { findUnique: jest.fn() },
    pago: { create: jest.fn(), findUnique: jest.fn() },
    serieComprobante: { upsert: jest.fn() },
    comprobante: { create: jest.fn() },
  };

  const prismaMock = {
    cliente: { findUnique: jest.fn(), findMany: jest.fn() },
    cuota: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    pago: { findUnique: jest.fn(), create: jest.fn() },
    comprobante: { findUnique: jest.fn() },
    $transaction: jest.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
    ...prismaOverrides,
  };

  return {
    tx,
    ctx: {
      prisma: prismaMock as unknown as ContextoServicio["prisma"],
      ahora: () => fechaFija,
      usuario: {
        id: userId,
        nombre: "Usuario Prueba",
        email: "prueba@sumaq.pe",
        rol,
      },
    },
  };
}

describe("Servicios de cobranzas con dobles de prueba (mock y stub)", () => {
  test("CuotasService.crearCuota valida rol, campos, cliente, duplicados y listado por rol", async () => {
    const { ctx: ctxCob } = crearContextoMock("COBRANZAS", {}, new Date("2026-11-20T12:00:00.000Z"), "cob-1");
    await expect(
      CuotasService.crearCuota(
        { clienteId: "cli-1", numero: 1, concepto: "Cuota 1", monto: 500, fechaVencimiento: "2026-12-01" },
        ctxCob
      )
    ).rejects.toMatchObject({ codigo: "ACCESO_DENEGADO", status: 403 });

    const cuotasMock = [
      {
        id: "c1",
        clienteId: "cli-1",
        numero: 1,
        concepto: "Cuota 1",
        monto: 500,
        fechaVencimiento: new Date("2026-11-10T05:00:00.000Z"),
        creadoEn: new Date("2026-11-01T00:00:00.000Z"),
        pagos: [{ montoCapital: 100 }],
        cliente: { id: "cli-1", nombre: "Cliente 1", documento: "12345678", responsableId: "cob-1" },
      },
    ];

    const { ctx } = crearContextoMock("ADMIN", {
      cliente: { findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValue({ id: "cli-1" }) },
      cuota: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: "cuota-dup" })
          .mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValue({ id: "cuota-ok", numero: 2 }),
        findMany: jest.fn().mockResolvedValue(cuotasMock),
        count: jest.fn().mockResolvedValue(1),
      },
    });

    await expect(
      CuotasService.crearCuota(
        { clienteId: "", numero: 1, concepto: "", monto: -10, fechaVencimiento: "2026-12-01" },
        ctx
      )
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      CuotasService.crearCuota(
        { clienteId: "cli-1", numero: 1, concepto: "C1", monto: 500, fechaVencimiento: "2026-12-01" },
        ctx
      )
    ).rejects.toMatchObject({ codigo: "CLIENTE_NO_ENCONTRADO", status: 404 });

    await expect(
      CuotasService.crearCuota(
        { clienteId: "cli-1", numero: 1, concepto: "C1", monto: 500, fechaVencimiento: "2026-12-01" },
        ctx
      )
    ).rejects.toMatchObject({ codigo: "CUOTA_DUPLICADA", status: 409 });

    const creada = await CuotasService.crearCuota(
      { clienteId: "cli-1", numero: 2, concepto: "Cuota 2", monto: 500, fechaVencimiento: "2026-12-15" },
      ctx
    );
    expect(creada.id).toBe("cuota-ok");

    const ctxCobConLista = crearContextoMock(
      "COBRANZAS",
      {
        cuota: {
          findMany: jest.fn().mockResolvedValue(cuotasMock),
          count: jest.fn().mockResolvedValue(1),
        },
      },
      new Date("2026-11-20T12:00:00.000Z"),
      "cob-1"
    ).ctx;

    const listadoCob = await CuotasService.listarCuotas({ clienteId: "cli-1", estado: "vencida" }, ctxCobConLista);
    expect(listadoCob.datos).toHaveLength(1);
    expect(listadoCob.datos[0].estado).toBe("vencida");
  });

  test("PagosService.registrarPago valida rol, idempotencia, permisos, cuota faltante, pagada y éxito", async () => {
    const { ctx: ctxAudit } = crearContextoMock("AUDITOR");
    await expect(
      PagosService.registrarPago({ cuotaId: "cuota-1", monto: 100, metodo: "EFECTIVO" }, ctxAudit)
    ).rejects.toMatchObject({ codigo: "ACCESO_DENEGADO", status: 403 });

    const { ctx: ctxCobOtro } = crearContextoMock(
      "COBRANZAS",
      {
        pago: {
          findUnique: jest.fn().mockResolvedValue({
            id: "pago-previo",
            cuota: { cliente: { responsableId: "otro-cob" } },
            comprobante: null,
          }),
        },
      },
      new Date("2026-11-20T12:00:00.000Z"),
      "cob-1"
    );
    await expect(
      PagosService.registrarPago({ cuotaId: "cuota-1", monto: 100, metodo: "EFECTIVO", idempotencyKey: "k-otro" }, ctxCobOtro)
    ).rejects.toMatchObject({ codigo: "CUOTA_NO_ENCONTRADA", status: 404 });

    const { ctx: ctxIdem } = crearContextoMock("ADMIN", {
      pago: {
        findUnique: jest.fn().mockResolvedValue({
          id: "pago-previo",
          cuota: { cliente: { responsableId: "user-1" } },
          comprobante: null,
        }),
      },
    });
    const idemRes = await PagosService.registrarPago(
      { cuotaId: "cuota-1", monto: 100, metodo: "EFECTIVO", idempotencyKey: "dup-key" },
      ctxIdem
    );
    expect(idemRes.idempotente).toBe(true);

    const { ctx, tx } = crearContextoMock("ADMIN");
    tx.cuota.findUnique.mockResolvedValueOnce(null);
    await expect(
      PagosService.registrarPago({ cuotaId: "no-existe", monto: 100, metodo: "EFECTIVO" }, ctx)
    ).rejects.toMatchObject({ codigo: "CUOTA_NO_ENCONTRADA", status: 404 });

    tx.cuota.findUnique.mockResolvedValueOnce({
      id: "cuota-pagada",
      monto: 500,
      fechaVencimiento: new Date("2026-11-25T05:00:00.000Z"),
      cliente: { id: "cli-1", responsableId: "user-1" },
      pagos: [{ montoCapital: 500 }],
    });
    await expect(
      PagosService.registrarPago({ cuotaId: "cuota-pagada", monto: 100, metodo: "EFECTIVO" }, ctx)
    ).rejects.toMatchObject({ codigo: "CUOTA_YA_PAGADA", status: 409 });

    tx.cuota.findUnique.mockResolvedValueOnce({
      id: "cuota-1",
      monto: 500,
      fechaVencimiento: new Date("2026-11-25T05:00:00.000Z"),
      cliente: { id: "cli-1", responsableId: "user-1" },
      pagos: [],
    });
    tx.pago.create.mockResolvedValueOnce({
      id: "pago-1",
      cuotaId: "cuota-1",
      monto: 200,
      montoCapital: 200,
      montoMora: 0,
    });

    const res = await PagosService.registrarPago(
      { cuotaId: "cuota-1", monto: 200, metodo: "TRANSFERENCIA", referencia: "OP-1" },
      ctx
    );
    expect(res.idempotente).toBe(false);
    expect(res.pago.id).toBe("pago-1");
  });

  test("ComprobantesService cubre errores 403/404/409, emisión correlativa y consulta", async () => {
    const { ctx: ctxAudit } = crearContextoMock("AUDITOR");
    await expect(
      ComprobantesService.emitirComprobante({ pagoId: "pago-1" }, ctxAudit)
    ).rejects.toMatchObject({ codigo: "ACCESO_DENEGADO", status: 403 });

    const { ctx, tx } = crearContextoMock("ADMIN", {
      comprobante: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            id: "comp-1",
            pagoId: "pago-1",
            serie: "F001",
            numero: 1,
            montoTotal: 500,
            emitidoEn: new Date("2026-11-20T12:00:00.000Z"),
            emitidoPorId: "user-1",
            estado: "EMITIDO",
            pago: {
              id: "pago-1",
              monto: 500,
              montoMora: 0,
              montoCapital: 500,
              metodo: "EFECTIVO",
              referencia: null,
              fechaPago: new Date("2026-11-20T12:00:00.000Z"),
              cuota: {
                id: "cuota-1",
                numero: 1,
                concepto: "Cuota 1",
                cliente: { id: "cli-1", nombre: "Cliente 1", documento: "12345678", responsableId: "user-1" },
              },
            },
          }),
      },
    });

    tx.pago.findUnique.mockResolvedValueOnce(null);
    await expect(
      ComprobantesService.emitirComprobante({ pagoId: "inexistente" }, ctx)
    ).rejects.toMatchObject({ codigo: "PAGO_NO_ENCONTRADO", status: 404 });

    tx.pago.findUnique.mockResolvedValueOnce({
      id: "pago-facturado",
      monto: 500,
      comprobante: { id: "comp-previo" },
      cuota: { cliente: { responsableId: "user-1" } },
    });
    await expect(
      ComprobantesService.emitirComprobante({ pagoId: "pago-facturado" }, ctx)
    ).rejects.toMatchObject({ codigo: "PAGO_YA_FACTURADO", status: 409 });

    tx.pago.findUnique.mockResolvedValueOnce({
      id: "pago-1",
      monto: 500,
      comprobante: null,
      cuota: { cliente: { responsableId: "user-1" } },
    });
    tx.serieComprobante.upsert.mockResolvedValueOnce({ serie: "F001", ultimoNumero: 1 });
    tx.comprobante.create.mockResolvedValueOnce({
      id: "comp-1",
      pagoId: "pago-1",
      serie: "F001",
      numero: 1,
      montoTotal: 500,
      estado: "EMITIDO",
    });

    const emitido = await ComprobantesService.emitirComprobante({ pagoId: "pago-1" }, ctx);
    expect(emitido.numeroCompleto).toBe("F001-00000001");

    await expect(ComprobantesService.obtenerPorId("no-existe", ctx)).rejects.toMatchObject({
      codigo: "COMPROBANTE_NO_ENCONTRADO",
      status: 404,
    });

    const consultado = await ComprobantesService.obtenerPorId("comp-1", ctx);
    expect(consultado.numeroCompleto).toBe("F001-00000001");
  });

  test("ReportesService.reporteMorosidad ordena morosos por deudaTotal descendente y filtra por rol COBRANZAS", async () => {
    const { ctx } = crearContextoMock("ADMIN", {
      cliente: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "c-menor",
            nombre: "Cliente Menor",
            responsableId: "user-1",
            cuotas: [
              {
                monto: 500,
                fechaVencimiento: new Date("2026-11-15T05:00:00.000Z"),
                pagos: [],
              },
            ],
          },
          {
            id: "c-mayor",
            nombre: "Cliente Mayor",
            responsableId: "user-1",
            cuotas: [
              {
                monto: 1000,
                fechaVencimiento: new Date("2026-10-01T05:00:00.000Z"),
                pagos: [],
              },
            ],
          },
        ]),
      },
    });

    const reporte = await ReportesService.reporteMorosidad(ctx);
    expect(reporte).toHaveLength(2);
    expect(reporte[0].clienteId).toBe("c-mayor");
    expect(reporte[0].deudaTotal).toBeGreaterThan(reporte[1].deudaTotal);

    const { ctx: ctxCob } = crearContextoMock("COBRANZAS", {
      cliente: { findMany: jest.fn().mockResolvedValue([]) },
    }, new Date("2026-11-20T12:00:00.000Z"), "cob-1");
    expect(await ReportesService.reporteMorosidad(ctxCob)).toEqual([]);
  });
});
