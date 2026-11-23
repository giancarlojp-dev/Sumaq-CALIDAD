import { PrismaClient, MetodoPago, EstadoComprobante } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

function diasAntes(dias: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - dias);
  return d;
}

function diasDespues(dias: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

async function main() {
  // Limpiar solo tablas de cobranzas en orden seguro de FK
  await prisma.comprobante.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.cuota.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.serieComprobante.deleteMany();

  const demoUser = await prisma.usuario.upsert({
    where: { id: "demo-user" },
    update: { nombre: "Usuario", email: "demo@sumaq.local", rol: "ADMIN" },
    create: {
      id: "demo-user",
      nombre: "Usuario",
      email: "demo@sumaq.local",
      rol: "ADMIN",
      passwordHash: hashPassword("seed-only"),
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { email: "admin.cobranzas@sumaq.pe" },
    update: { nombre: "Admin Cobranzas", rol: "ADMIN" },
    create: {
      nombre: "Admin Cobranzas",
      email: "admin.cobranzas@sumaq.pe",
      rol: "ADMIN",
      passwordHash: hashPassword("Admin123*"),
    },
  });

  const cobrador1 = await prisma.usuario.upsert({
    where: { email: "cobrador1@sumaq.pe" },
    update: { nombre: "Cobrador Uno", rol: "COBRANZAS" },
    create: {
      nombre: "Cobrador Uno",
      email: "cobrador1@sumaq.pe",
      rol: "COBRANZAS",
      passwordHash: hashPassword("Cobro123*"),
    },
  });

  const cobrador2 = await prisma.usuario.upsert({
    where: { email: "cobrador2@sumaq.pe" },
    update: { nombre: "Cobrador Dos", rol: "COBRANZAS" },
    create: {
      nombre: "Cobrador Dos",
      email: "cobrador2@sumaq.pe",
      rol: "COBRANZAS",
      passwordHash: hashPassword("Cobro123*"),
    },
  });

  const auditor = await prisma.usuario.upsert({
    where: { email: "auditor@sumaq.pe" },
    update: { nombre: "Auditor Financiero", rol: "AUDITOR" },
    create: {
      nombre: "Auditor Financiero",
      email: "auditor@sumaq.pe",
      rol: "AUDITOR",
      passwordHash: hashPassword("Audit123*"),
    },
  });

  await prisma.serieComprobante.create({
    data: { serie: "F001", ultimoNumero: 1 },
  });

  // Cliente A: al día (3 cuotas futuras de S/ 500)
  const clienteA = await prisma.cliente.create({
    data: {
      nombre: "Cliente A - Al Dia",
      documento: "20600000011",
      email: "clientea@sumaq.pe",
      telefono: "999000001",
      proyecto: "Proyecto Sumaq Cañete I",
      responsableId: cobrador1.id,
    },
  });
  for (let i = 1; i <= 3; i++) {
    await prisma.cuota.create({
      data: {
        clienteId: clienteA.id,
        numero: i,
        concepto: `Cuota futura #${i}`,
        monto: "500.00",
        fechaVencimiento: diasDespues(i * 30),
      },
    });
  }

  // Cliente B: atraso corto (cuota vencida hace 5 días -> mora S/ 12.50)
  const clienteB = await prisma.cliente.create({
    data: {
      nombre: "Cliente B - Atraso 5 Dias",
      documento: "20600000022",
      email: "clienteb@sumaq.pe",
      telefono: "999000002",
      proyecto: "Proyecto Sumaq Cañete I",
      responsableId: cobrador1.id,
    },
  });
  await prisma.cuota.create({
    data: {
      clienteId: clienteB.id,
      numero: 1,
      concepto: "Cuota vencida 5 días",
      monto: "500.00",
      fechaVencimiento: diasAntes(5),
    },
  });

  // Cliente C: atraso prolongado (cuota vencida hace 120 días -> mora tope S/ 100.00)
  const clienteC = await prisma.cliente.create({
    data: {
      nombre: "Cliente C - Atraso 120 Dias",
      documento: "20600000033",
      email: "clientec@sumaq.pe",
      telefono: "999000003",
      proyecto: "Proyecto Sumaq Cañete II",
      responsableId: cobrador1.id,
    },
  });
  await prisma.cuota.create({
    data: {
      clienteId: clienteC.id,
      numero: 1,
      concepto: "Cuota vencida 120 días",
      monto: "500.00",
      fechaVencimiento: diasAntes(120),
    },
  });

  // Cliente D: pago parcial de S/ 200 sobre cuota de S/ 500 vencida hace 10 días
  const clienteD = await prisma.cliente.create({
    data: {
      nombre: "Cliente D - Pago Parcial",
      documento: "20600000044",
      email: "cliented@sumaq.pe",
      telefono: "999000004",
      proyecto: "Proyecto Sumaq Cañete II",
      responsableId: cobrador1.id,
    },
  });
  const cuotaD = await prisma.cuota.create({
    data: {
      clienteId: clienteD.id,
      numero: 1,
      concepto: "Cuota vencida 10 días con pago parcial",
      monto: "500.00",
      fechaVencimiento: diasAntes(10),
    },
  });
  await prisma.pago.create({
    data: {
      cuotaId: cuotaD.id,
      monto: "200.00",
      montoMora: "0.00",
      montoCapital: "200.00",
      metodo: MetodoPago.TRANSFERENCIA,
      referencia: "SEED-PAGO-D",
      idempotencyKey: "seed-idem-cliente-d-1",
      registradoPorId: cobrador1.id,
    },
  });

  // Cliente E: cuota pagada con comprobante F001-00000001
  const clienteE = await prisma.cliente.create({
    data: {
      nombre: "Cliente E - Facturado",
      documento: "20600000055",
      email: "clientee@sumaq.pe",
      telefono: "999000005",
      proyecto: "Proyecto Sumaq Cañete I",
      responsableId: cobrador1.id,
    },
  });
  const cuotaE = await prisma.cuota.create({
    data: {
      clienteId: clienteE.id,
      numero: 1,
      concepto: "Cuota cancelada y facturada",
      monto: "500.00",
      fechaVencimiento: diasDespues(10),
    },
  });
  const pagoE = await prisma.pago.create({
    data: {
      cuotaId: cuotaE.id,
      monto: "500.00",
      montoMora: "0.00",
      montoCapital: "500.00",
      metodo: MetodoPago.EFECTIVO,
      referencia: "SEED-PAGO-E",
      idempotencyKey: "seed-idem-cliente-e-1",
      registradoPorId: admin.id,
    },
  });
  await prisma.comprobante.create({
    data: {
      pagoId: pagoE.id,
      serie: "F001",
      numero: 1,
      montoTotal: "500.00",
      emitidoPorId: admin.id,
      estado: EstadoComprobante.EMITIDO,
    },
  });

  // Cliente F: asignado a cobrador2 para probar control de acceso a objetos ajenos
  const clienteF = await prisma.cliente.create({
    data: {
      nombre: "Cliente F - Otro Responsable",
      documento: "20600000066",
      email: "clientef@sumaq.pe",
      telefono: "999000006",
      proyecto: "Proyecto Sumaq Cañete III",
      responsableId: cobrador2.id,
    },
  });
  await prisma.cuota.create({
    data: {
      clienteId: clienteF.id,
      numero: 1,
      concepto: "Cuota asignada a cobrador2",
      monto: "500.00",
      fechaVencimiento: diasDespues(15),
    },
  });

  console.log("Semilla de cobranzas cargada:", {
    usuarios: [
      demoUser.email,
      admin.email,
      cobrador1.email,
      cobrador2.email,
      auditor.email,
    ],
    clientes: 6,
    comprobanteInicial: "F001-00000001",
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
