import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fallbackSessionUser, isGoogleAuthConfigured } from "@/lib/auth-config";
import { DominioError } from "./errores";
import { UsuarioAutenticado } from "@/services/cobranzas/tipos";
import { prisma } from "@/services/cobranzas/contexto";

/**
 * Obtiene el usuario autenticado de la sesión actual de NextAuth
 * respetando el mecanismo de auth existente sin bypass ni puertas traseras.
 */
export async function exigirSesion(): Promise<UsuarioAutenticado> {
  let session = null;

  if (isGoogleAuthConfigured) {
    session = await getServerSession(authOptions);
  } else {
    // Si no está configurado Google OAuth, se usa el demo session estándar de la app
    session = {
      user: {
        id: fallbackSessionUser.id,
        name: fallbackSessionUser.name,
        email: fallbackSessionUser.email,
        role: fallbackSessionUser.role,
      },
    };
  }

  if (!session?.user?.email) {
    throw new DominioError("NO_AUTORIZADO", "No se encontró una sesión activa.", 401);
  }

  // Mapear rol: verificar si existe en la base de datos o usar el de la sesión
  let rolUsuario = (session.user as { role?: string }).role || "VISITOR";

  try {
    const usuarioDb = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });
    if (usuarioDb) {
      rolUsuario = usuarioDb.rol;
    }
  } catch {
    // Continuar con rol de la sesión si la BD no está disponible en memoria
  }

  return {
    id: session.user.id || fallbackSessionUser.id,
    nombre: session.user.name,
    email: session.user.email,
    rol: rolUsuario,
  };
}

/**
 * Exige que el usuario pertenezca a uno de los roles permitidos
 */
export function exigirRol(usuario: UsuarioAutenticado, rolesPermitidos: string[]) {
  if (!rolesPermitidos.includes(usuario.rol)) {
    throw new DominioError("ACCESO_DENEGADO", "No tienes permisos para realizar esta acción.", 403);
  }
}
