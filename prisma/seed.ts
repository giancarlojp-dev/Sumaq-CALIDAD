import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function fechaRelativa(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Ejecutando semilla idempotente de Cobranzas y Facturación...");

  // 1. Usuarios del sistema
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@sumaq.local" },
    update: { rol: "ADMIN" },
    create: {
      nombre: "Administrador Cobranzas",
      email: "admin@sumaq.local",
      rol: "ADMIN",
      passwordHash: "hash-seguro-demo",
    },
  });

  const cobrador1 = await prisma.usuario.upsert({
    where: { email: "cobrador1@sumaq.local" },
    update: { rol: "COBRANZAS" },
    create: {
      nombre: "Gestor Cobranzas Principal",
      email: "cobrador1@sumaq.local",
      rol: "COBRANZAS",
      passwordHash: "hash-seguro-demo",
    },
  });

  const cobrador2 = await prisma.usuario.upsert({
    where: { email: "cobrador2@sumaq.local" },
    update: { rol: "COBRANZAS" },
    create: {
      nombre: "Gestor Cobranzas Secundario",
      email: "cobrador2@sumaq.local",
      rol: "COBRANZAS",
      passwordHash: "hash-seguro-demo",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "auditor@sumaq.local" },
    update: { rol: "AUDITOR" },
    create: {
      nombre: "Auditor de Calidad",
      email: "auditor@sumaq.local",
      rol: "AUDITOR",
      passwordHash: "hash-seguro-demo",
    },
  });

  // Serie inicial
  await prisma.serieComprobante.upsert({
    where: { serie: "F001" },
    update: {},
    create: {
      serie: "F001",
      ultimoNumero: 0,
    },
  });

  // Limpiar únicamente datos de cobranzas para idempotencia limpia
  await prisma.comprobante.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.cuota.deleteMany();
  await prisma.cliente.deleteMany();

  // -------------------------------------------------------------
  // Escenario A: Cliente A - Al día (3 cuotas futuras de S/ 500, sin pagos)
  // -------------------------------------------------------------
  const clienteA = await prisma.cliente.create({
    data: {
      nombre: "Cliente A (Al Día)",
      documento: "10000001",
      email: "clientea@sumaq.local",
      telefono: "999111001",
      proyecto: "Ventas Lotes - Etapa 1",
      responsableId: cobrador1.id,
      cuotas: {
        create: [
          {
            numero: 1,
            concepto: "Cuota 01/03 Lote A-01",
            monto: new Prisma.Decimal(500.0),
            fechaVencimiento: fechaRelativa(15),
          },
          {
            numero: 2,
            concepto: "Cuota 02/03 Lote A-01",
            monto: new Prisma.Decimal(500.0),
            fechaVencimiento: fechaRelativa(45),
          },
          {
            numero: 3,
            concepto: "Cuota 03/03 Lote A-01",
            monto: new Prisma.Decimal(500.0),
            fechaVencimiento: fechaRelativa(75),
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------
  // Escenario B: Cliente B - Atraso corto (vencida hace 5 días, mora S/ 12.50)
  // -------------------------------------------------------------
  const clienteB = await prisma.cliente.create({
    data: {
      nombre: "Cliente B (Atraso Corto)",
      documento: "10000002",
      email: "clienteb@sumaq.local",
      telefono: "999111002",
      proyecto: "Ventas Lotes - Etapa 1",
      responsableId: cobrador1.id,
      cuotas: {
        create: [
          {
            numero: 1,
            concepto: "Cuota 01/01 Lote B-02",
            monto: new Prisma.Decimal(500.0),
            fechaVencimiento: fechaRelativa(-5),
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------
  // Escenario C: Cliente C - Atraso prolongado (vencida hace 120 días, mora saturada en S/ 100.00)
  // -------------------------------------------------------------
  const clienteC = await prisma.cliente.create({
    data: {
      nombre: "Cliente C (Atraso Prolongado)",
      documento: "10000003",
      email: "clientec@sumaq.local",
      telefono: "999111003",
      proyecto: "Ventas Lotes - Etapa 1",
      responsableId: cobrador1.id,
      cuotas: {
        create: [
          {
            numero: 1,
            concepto: "Cuota 01/01 Lote C-03",
            monto: new Prisma.Decimal(500.0),
            fechaVencimiento: fechaRelativa(-120),
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------
  // Escenario D: Cliente D - Pago parcial (vencida hace 10 días, pago previo de S/ 200)
  // -------------------------------------------------------------
  const clienteD = await prisma.cliente.create({
    data: {
      nombre: "Cliente D (Pago Parcial)",
      documento: "10000004",
      email: "cliented@sumaq.local",
      telefono: "999111004",
      proyecto: "Ventas Lotes - Etapa 1",
      responsableId: cobrador1.id,
    },
  });

  const cuotaD = await prisma.cuota.create({
    data: {
      clienteId: clienteD.id,
      numero: 1,
      concepto: "Cuota 01/01 Lote D-04",
      monto: new Prisma.Decimal(500.0),
      fechaVencimiento: fechaRelativa(-10),
    },
  });

  await prisma.pago.create({
    data: {
      cuotaId: cuotaD.id,
      monto: new Prisma.Decimal(200.0),
      montoMora: new Prisma.Decimal(0.0),
      montoCapital: new Prisma.Decimal(200.0),
      metodo: "TRANSFERENCIA",
      referencia: "TRANS-PARCIAL-D",
      idempotencyKey: "IDEM-PAGO-D-001",
      registradoPorId: cobrador1.id,
      fechaPago: fechaRelativa(-5),
    },
  });

  // -------------------------------------------------------------
  // Escenario E: Cliente E - Cuota pagada con comprobante F001-00000001
  // -------------------------------------------------------------
  const clienteE = await prisma.cliente.create({
    data: {
      nombre: "Cliente E (Pagada y Facturada)",
      documento: "10000005",
      email: "clientee@sumaq.local",
      telefono: "999111005",
      proyecto: "Ventas Lotes - Etapa 1",
      responsableId: cobrador1.id,
    },
  });

  const cuotaE = await prisma.cuota.create({
    data: {
      clienteId: clienteE.id,
      numero: 1,
      concepto: "Cuota 01/01 Lote E-05",
      monto: new Prisma.Decimal(500.0),
      fechaVencimiento: fechaRelativa(-20),
    },
  });

  const pagoE = await prisma.pago.create({
    data: {
      cuotaId: cuotaE.id,
      monto: new Prisma.Decimal(500.0),
      montoMora: new Prisma.Decimal(0.0),
      montoCapital: new Prisma.Decimal(500.0),
      metodo: "TRANSFERENCIA",
      referencia: "TRANS-TOTAL-E",
      idempotencyKey: "IDEM-PAGO-E-001",
      registradoPorId: cobrador1.id,
      fechaPago: fechaRelativa(-1),
    },
  });

  await prisma.serieComprobante.upsert({
    where: { serie: "F001" },
    update: { ultimoNumero: 1 },
    create: { serie: "F001", ultimoNumero: 1 },
  });

  await prisma.comprobante.create({
    data: {
      pagoId: pagoE.id,
      serie: "F001",
      numero: 1,
      montoTotal: new Prisma.Decimal(500.0),
      emitidoEn: fechaRelativa(-1),
      emitidoPorId: admin.id,
      estado: "EMITIDO",
    },
  });

  // -------------------------------------------------------------
  // Escenario F: Cliente F - Asignado a cobrador2 (para pruebas de aislamiento de objetos)
  // -------------------------------------------------------------
  await prisma.cliente.create({
    data: {
      nombre: "Cliente F (Ajeno a Cobrador 1)",
      documento: "10000006",
      email: "clientef@sumaq.local",
      telefono: "999111006",
      proyecto: "Ventas Lotes - Etapa 2",
      responsableId: cobrador2.id,
      cuotas: {
        create: [
          {
            numero: 1,
            concepto: "Cuota 01/01 Lote F-06",
            monto: new Prisma.Decimal(650.0),
            fechaVencimiento: fechaRelativa(-15),
          },
        ],
      },
    },
  });

  console.log("✅ Semilla ejecutada con éxito. Clientes A, B, C, D, E y F listos para pruebas.");
}

main()
  .catch((e) => {
    console.error("❌ Error en la semilla de cobranzas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
