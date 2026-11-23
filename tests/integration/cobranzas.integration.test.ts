import { PrismaClient } from "@prisma/client";
import {
  crearPrismaTest,
  limpiarDatosCobranzasTest,
  resolverUrlTestSegura,
} from "./db-test";
import { CuotasService } from "@/services/cobranzas/cuotasService";
import { PagosService } from "@/services/cobranzas/pagosService";
import { ComprobantesService } from "@/services/cobranzas/comprobantesService";
import { ReportesService } from "@/services/cobranzas/reportesService";
import { ContextoServicio } from "@/services/cobranzas/tipos";
import { getServerSession } from "next-auth";
import * as contextoMod from "@/services/cobranzas/contexto";
import { POST as postCuota, GET as getCuotas } from "@/app/api/cuotas/route";
import { POST as postFactura } from "@/app/api/facturas/route";
import { GET as getMorosidad } from "@/app/api/reportes/morosidad/route";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth-config", () => ({
  isGoogleAuthConfigured: true,
  fallbackSessionUser: {
    id: "demo-user",
    name: "Usuario",
    email: "demo@sumaq.local",
    role: "ADMIN",
  },
}));

describe("Pruebas de integración de Cobranzas contra DATABASE_URL_TEST", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = crearPrismaTest();
  });

  beforeEach(async () => {
    await limpiarDatosCobranzasTest(prisma);
  });

  afterAll(async () => {
    if (prisma) {
      await limpiarDatosCobranzasTest(prisma);
      await prisma.$disconnect();
    }
  });

  test("Seguridad: rechaza si DATABASE_URL_TEST falta o coincide con DATABASE_URL", () => {
    const originalTest = process.env.DATABASE_URL_TEST;
    const originalDev = process.env.DATABASE_URL;

    try {
      process.env.DATABASE_URL_TEST = "";
      expect(() => resolverUrlTestSegura()).toThrow(/SEGURIDAD_BD/);

      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5433/sumaq_test";
      process.env.DATABASE_URL_TEST =
        "postgresql://user:pass@localhost:5433/sumaq_test";
      expect(() => resolverUrlTestSegura()).toThrow(/SEGURIDAD_BD/);
    } finally {
      process.env.DATABASE_URL_TEST = originalTest;
      process.env.DATABASE_URL = originalDev;
    }
  });

  test("Flujo completo: cuotas, duplicados, pago con mora, idempotencia, comprobantes y morosidad", async () => {
    const fechaFija = new Date("2026-11-20T12:00:00.000Z");

    const admin = await prisma.usuario.create({
      data: {
        id: "usr-admin-int",
        nombre: "Admin Integración",
        email: "admin@test-cobranzas.local",
        rol: "ADMIN",
        passwordHash: "hash-test",
      },
    });

    const cobrador1 = await prisma.usuario.create({
      data: {
        id: "usr-cob1-int",
        nombre: "Cobrador 1",
        email: "cob1@test-cobranzas.local",
        rol: "COBRANZAS",
        passwordHash: "hash-test",
      },
    });

    const cobrador2 = await prisma.usuario.create({
      data: {
        id: "usr-cob2-int",
        nombre: "Cobrador 2",
        email: "cob2@test-cobranzas.local",
        rol: "COBRANZAS",
        passwordHash: "hash-test",
      },
    });

    const cliente1 = await prisma.cliente.create({
      data: {
        id: "cli-int-1",
        nombre: "Cliente Integración 1",
        documento: "10451234561",
        email: "cli1@test-cobranzas.local",
        proyecto: "Proyecto Sunampe",
        responsableId: cobrador1.id,
      },
    });

    const cliente2 = await prisma.cliente.create({
      data: {
        id: "cli-int-2",
        nombre: "Cliente Integración 2",
        documento: "10451234562",
        email: "cli2@test-cobranzas.local",
        proyecto: "Proyecto Sunampe",
        responsableId: cobrador2.id,
      },
    });

    const ctxAdmin: ContextoServicio = {
      prisma,
      ahora: () => fechaFija,
      usuario: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
      },
    };

    const ctxCob1: ContextoServicio = {
      prisma,
      ahora: () => fechaFija,
      usuario: {
        id: cobrador1.id,
        nombre: cobrador1.nombre,
        email: cobrador1.email,
        rol: cobrador1.rol,
      },
    };

    // 1. Crear cuota vencida para cliente1 (10 días de atraso: venció 2026-11-10) y otra para cliente2
    const cuota1 = await CuotasService.crearCuota(
      {
        clienteId: cliente1.id,
        numero: 1,
        concepto: "Cuota 1 - Noviembre",
        monto: 500,
        fechaVencimiento: "2026-11-10T05:00:00.000Z",
      },
      ctxAdmin,
    );

    await expect(
      CuotasService.crearCuota(
        {
          clienteId: cliente1.id,
          numero: 1,
          concepto: "Duplicada",
          monto: 500,
          fechaVencimiento: "2026-11-10T05:00:00.000Z",
        },
        ctxAdmin,
      ),
    ).rejects.toMatchObject({ codigo: "CUOTA_DUPLICADA", status: 409 });

    await CuotasService.crearCuota(
      {
        clienteId: cliente2.id,
        numero: 1,
        concepto: "Cuota 1 - Cliente 2",
        monto: 1200,
        fechaVencimiento: "2026-10-20T05:00:00.000Z",
      },
      ctxAdmin,
    );

    // Cobrador 1 solo ve cuotas de cliente1
    const listadoCob1 = await CuotasService.listarCuotas({}, ctxCob1);
    expect(listadoCob1.datos).toHaveLength(1);
    expect(listadoCob1.datos[0].clienteId).toBe(cliente1.id);
    expect(listadoCob1.datos[0].diasAtraso).toBe(10);
    expect(listadoCob1.datos[0].mora).toBe(25); // 500 * 0.005 * 10 = 25

    // 2. Registrar pago con Idempotency-Key
    const pagoRes1 = await PagosService.registrarPago(
      {
        cuotaId: cuota1.id,
        monto: 125,
        metodo: "TRANSFERENCIA",
        referencia: "OP-998877",
        idempotencyKey: "idem-pago-int-001",
      },
      ctxCob1,
    );
    expect(pagoRes1.idempotente).toBe(false);
    expect(Number(pagoRes1.pago.montoMora)).toBe(25);
    expect(Number(pagoRes1.pago.montoCapital)).toBe(100);

    const pagoResRepetido = await PagosService.registrarPago(
      {
        cuotaId: cuota1.id,
        monto: 125,
        metodo: "TRANSFERENCIA",
        referencia: "OP-998877",
        idempotencyKey: "idem-pago-int-001",
      },
      ctxCob1,
    );
    expect(pagoResRepetido.idempotente).toBe(true);
    expect(pagoResRepetido.pago.id).toBe(pagoRes1.pago.id);

    // 3. Emitir comprobante correlativo y bloquear duplicado
    const comp1 = await ComprobantesService.emitirComprobante(
      { pagoId: pagoRes1.pago.id },
      ctxCob1,
    );
    expect(comp1.numeroCompleto).toBe("F001-00000001");

    await expect(
      ComprobantesService.emitirComprobante(
        { pagoId: pagoRes1.pago.id },
        ctxCob1,
      ),
    ).rejects.toMatchObject({ codigo: "PAGO_YA_FACTURADO", status: 409 });

    // 4. Reporte de morosidad ordenado por deudaTotal descendente
    const reporte = await ReportesService.reporteMorosidad(ctxAdmin);
    expect(reporte).toHaveLength(2);
    expect(reporte[0].clienteId).toBe(cliente2.id);
    expect(reporte[1].clienteId).toBe(cliente1.id);
    expect(reporte[0].deudaTotal).toBeGreaterThan(reporte[1].deudaTotal);
  });
});

describe("Pruebas de integración de Route Handlers con Request contra DATABASE_URL_TEST", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = crearPrismaTest();
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.mocked(getServerSession).mockReset();
    await limpiarDatosCobranzasTest(prisma);
    jest
      .spyOn(contextoMod, "crearContextoPorDefecto")
      .mockImplementation((usuario) => ({
        prisma,
        ahora: () => new Date("2026-11-20T12:00:00.000Z"),
        usuario,
      }));
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    if (prisma) {
      await limpiarDatosCobranzasTest(prisma);
      await prisma.$disconnect();
    }
  });

  async function sembrarBase() {
    const admin = await prisma.usuario.create({
      data: {
        id: "usr-admin-rh",
        nombre: "Admin RH",
        email: "admin-rh@test-cobranzas.local",
        rol: "ADMIN",
        passwordHash: "hash-test",
      },
    });
    const auditor = await prisma.usuario.create({
      data: {
        id: "usr-aud-rh",
        nombre: "Auditor RH",
        email: "aud-rh@test-cobranzas.local",
        rol: "AUDITOR",
        passwordHash: "hash-test",
      },
    });
    const cliente = await prisma.cliente.create({
      data: {
        id: "cli-rh-1",
        nombre: "Cliente RH",
        documento: "10451234599",
        email: "clirh@test-cobranzas.local",
        proyecto: "Proyecto Sunampe",
        responsableId: admin.id,
      },
    });
    return { admin, auditor, cliente };
  }

  test("CNF-01: sin sesión retorna HTTP 401 en GET /api/cuotas", async () => {
    jest.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request(
      "http://localhost:3001/api/cuotas?pagina=1&limite=10",
    );
    const res = await getCuotas(req);
    expect(res.status).toBe(401);
  });

  test("CNF-02: rol AUDITOR intentando crear cuota retorna HTTP 403", async () => {
    const { auditor, cliente } = await sembrarBase();
    jest.mocked(getServerSession).mockResolvedValue({
      user: {
        id: auditor.id,
        name: auditor.nombre,
        email: auditor.email,
        role: "AUDITOR",
      },
      expires: "2026-11-21T00:00:00.000Z",
    } as never);
    jest
      .spyOn(contextoMod.prisma.usuario, "findUnique")
      .mockResolvedValue(auditor as never);

    const req = new Request("http://localhost:3001/api/cuotas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: cliente.id,
        numero: 1,
        concepto: "Cuota bloqueada",
        monto: 500,
        fechaVencimiento: "2026-11-10T05:00:00.000Z",
      }),
    });
    const res = await postCuota(req);
    expect(res.status).toBe(403);
  });

  test("CNF-04: inyección SQL en clienteId es tratada como texto y no provoca HTTP 500", async () => {
    const { admin } = await sembrarBase();
    jest.mocked(getServerSession).mockResolvedValue({
      user: {
        id: admin.id,
        name: admin.nombre,
        email: admin.email,
        role: "ADMIN",
      },
      expires: "2026-11-21T00:00:00.000Z",
    } as never);
    jest
      .spyOn(contextoMod.prisma.usuario, "findUnique")
      .mockResolvedValue(admin as never);

    const req = new Request(
      "http://localhost:3001/api/cuotas?clienteId=" +
        encodeURIComponent("' OR 1=1 --"),
    );
    const res = await getCuotas(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.datos)).toBe(true);
    expect(body.datos).toHaveLength(0);
  });

  test("CP-12 y CP-15: emisión correlativa vía POST /api/facturas y morosidad vía GET /api/reportes/morosidad", async () => {
    const { admin, cliente } = await sembrarBase();
    jest.mocked(getServerSession).mockResolvedValue({
      user: {
        id: admin.id,
        name: admin.nombre,
        email: admin.email,
        role: "ADMIN",
      },
      expires: "2026-11-21T00:00:00.000Z",
    } as never);
    jest
      .spyOn(contextoMod.prisma.usuario, "findUnique")
      .mockResolvedValue(admin as never);

    const cuota = await prisma.cuota.create({
      data: {
        clienteId: cliente.id,
        numero: 1,
        concepto: "Cuota 1",
        monto: 500,
        fechaVencimiento: new Date("2026-11-10T05:00:00.000Z"),
      },
    });

    const pago = await prisma.pago.create({
      data: {
        cuotaId: cuota.id,
        monto: 100,
        montoCapital: 100,
        montoMora: 0,
        metodo: "EFECTIVO",
        registradoPorId: admin.id,
      },
    });

    const reqComp = new Request("http://localhost:3001/api/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagoId: pago.id }),
    });
    const resComp = await postFactura(reqComp);
    expect(resComp.status).toBe(201);
    const compJson = await resComp.json();
    expect(compJson.numeroCompleto).toBe("F001-00000001");

    const reqRep = new Request("http://localhost:3001/api/reportes/morosidad");
    const resRep = await getMorosidad();
    expect(resRep.status).toBe(200);
    const repJson = await resRep.json();
    expect(Array.isArray(repJson)).toBe(true);
    expect(repJson.length).toBeGreaterThanOrEqual(1);
  });
});
