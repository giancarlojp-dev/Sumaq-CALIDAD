import { PrismaClient } from "@prisma/client";

export function resolverUrlTestSegura(): string {
  const testUrl = process.env.DATABASE_URL_TEST?.trim();
  const devUrl = process.env.DATABASE_URL?.trim();

  if (!testUrl) {
    throw new Error(
      "SEGURIDAD_BD: Falta DATABASE_URL_TEST. Configura una base de pruebas separada antes de correr pruebas de integración."
    );
  }

  if (devUrl && testUrl === devUrl) {
    throw new Error(
      "SEGURIDAD_BD: DATABASE_URL_TEST no puede ser igual a DATABASE_URL. Abortando para proteger la base de desarrollo."
    );
  }

  return testUrl;
}

export function crearPrismaTest(): PrismaClient {
  const url = resolverUrlTestSegura();
  return new PrismaClient({
    datasources: {
      db: { url },
    },
  });
}

export async function limpiarDatosCobranzasTest(prisma: PrismaClient): Promise<void> {
  resolverUrlTestSegura();
  await prisma.comprobante.deleteMany({});
  await prisma.serieComprobante.deleteMany({});
  await prisma.pago.deleteMany({});
  await prisma.cuota.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.usuario.deleteMany({
    where: {
      email: { endsWith: "@test-cobranzas.local" },
    },
  });
}
