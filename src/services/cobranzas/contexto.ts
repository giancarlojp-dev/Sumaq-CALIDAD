import { PrismaClient } from "@prisma/client";
import { ContextoServicio, UsuarioAutenticado } from "./tipos";

// Instancia singleton para Prisma en servicios
const globalForPrisma = globalThis as unknown as { prismaCliente?: PrismaClient };

export const prisma = globalForPrisma.prismaCliente ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaCliente = prisma;
}

/**
 * Fábrica de contexto por defecto para Route Handlers
 */
export function crearContextoPorDefecto(usuario: UsuarioAutenticado): ContextoServicio {
  return {
    prisma,
    ahora: () => new Date(),
    usuario,
  };
}
