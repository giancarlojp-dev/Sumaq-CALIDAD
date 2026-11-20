// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Aquí le decimos a NextAuth que nuestra sesión
   * tiene un ID y un ROL extra.
   */
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}