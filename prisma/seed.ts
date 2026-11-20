import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inicializando sistema Sumaq...");

  await prisma.recomendacion.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.qaRegistro.deleteMany();
  await prisma.movimiento.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.inventario.deleteMany();
  await prisma.usuario.deleteMany();

  const usuario = await prisma.usuario.create({
    data: {
      nombre: "Lui Choccllo",
      email: "luicxz.09.11@gmail.com",
      rol: "ADMIN",
      passwordHash: "demo-hash",
    },
  });

  const inventarioCreado = await prisma.inventario.createMany({
    data: [
      {
        nombre: "Arroz Premium",
        categoria: "Alimentos",
        stockActual: 42,
        ubicacion: "Zona A",
        puntoReorden: 25,
        capacidadMaxima: 120,
      },
      {
        nombre: "Botellas de Agua",
        categoria: "Bebidas",
        stockActual: 16,
        ubicacion: "Zona B",
        puntoReorden: 20,
        capacidadMaxima: 100,
      },
      {
        nombre: "Cargador USB-C",
        categoria: "Electrónica",
        stockActual: 8,
        ubicacion: "Zona C",
        puntoReorden: 10,
        capacidadMaxima: 60,
      },
    ],
  });

  const inventarios = await prisma.inventario.findMany();
  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: "Campaña de Verano",
      descripcion: "Aprovisionamiento para operaciones externas",
      fechaInicio: new Date("2026-06-01"),
      fechaFin: new Date("2026-08-31"),
      estado: "En curso",
    },
  });

  await prisma.movimiento.createMany({
    data: [
      {
        idItem: inventarios[0].id,
        tipoMovimiento: "Entrada",
        cantidad: 20,
      },
      {
        idItem: inventarios[1].id,
        tipoMovimiento: "Salida",
        cantidad: 6,
      },
      {
        idItem: inventarios[2].id,
        tipoMovimiento: "Entrada",
        cantidad: 12,
      },
    ],
  });

  await prisma.qaRegistro.createMany({
    data: [
      {
        idItem: inventarios[0].id,
        idProyecto: proyecto.id,
        estadoQa: "Aprobado",
        observacion: "Cumple estándar de calidad",
      },
      {
        idItem: inventarios[2].id,
        idProyecto: proyecto.id,
        estadoQa: "En Revisión",
        observacion: "Revisar embalaje y cableado",
      },
    ],
  });

  await prisma.alerta.createMany({
    data: [
      {
        idItem: inventarios[1].id,
        nivelAlerta: "Rojo",
        mensaje: "Stock por debajo del punto de reorden",
      },
      {
        idItem: inventarios[2].id,
        nivelAlerta: "Amarillo",
        mensaje: "Demanda creciente en la próxima semana",
      },
    ],
  });

  await prisma.recomendacion.createMany({
    data: [
      {
        idItem: inventarios[2].id,
        ubicacionSugerida: "Zona B",
      },
    ],
  });

  console.log(`👤 Usuario creado: ${usuario.nombre}`);
  console.log(`✅ Seed completado con ${inventarioCreado.count} inventarios y 1 proyecto.`);
}

main()
  .catch((error) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });