import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fallbackSessionUser, isGoogleAuthConfigured } from "@/lib/auth-config";

export async function getAppSession() {
  if (!isGoogleAuthConfigured) {
    return {
      user: {
        id: fallbackSessionUser.id,
        name: fallbackSessionUser.name,
        email: fallbackSessionUser.email,
        image: fallbackSessionUser.image,
        role: fallbackSessionUser.role,
      },
    } as any;
  }

  return getServerSession(authOptions);
}

// Esta función devuelve el usuario ADMIN o null si falla la seguridad
export async function getCurrentAdmin() {
  // 1. Obtener sesión
  const session = await getAppSession();
  
  // 2. Si no hay sesión o email, rechazar inmediatamente
  if (!session?.user?.email) return null;

  // 3. Buscar usuario en base de datos
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  // 4. Si no existe o NO es ADMIN, rechazar
  if (!user || user.role !== "ADMIN") return null;

  // 5. Si todo está bien, devolver el usuario
  return user;
}