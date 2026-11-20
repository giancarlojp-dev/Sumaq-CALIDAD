import { PrismaClient } from "@prisma/client";

export interface UsuarioAutenticado {
  id: string;
  nombre?: string | null;
  email: string;
  rol: string;
}

export interface ContextoServicio {
  prisma: PrismaClient;
  ahora: () => Date;
  usuario: UsuarioAutenticado;
}

export interface CrearCuotaInput {
  clienteId: string;
  numero: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string | Date;
}

export interface FiltrosCuotas {
  clienteId?: string;
  estado?: string;
  pagina?: number;
  limite?: number;
}

export interface RegistrarPagoInput {
  cuotaId: string;
  monto: number;
  metodo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";
  referencia?: string;
  idempotencyKey?: string;
}

export interface EmitirComprobanteInput {
  pagoId: string;
  serie?: string;
}
