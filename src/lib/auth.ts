// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { fallbackSessionUser, isGoogleAuthConfigured } from "@/lib/auth-config";

const providers = isGoogleAuthConfigured
  ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ]
  : [
      CredentialsProvider({
        name: "Demo",
        credentials: {},
        async authorize() {
          return {
            id: fallbackSessionUser.id,
            name: fallbackSessionUser.name,
            email: fallbackSessionUser.email,
            image: fallbackSessionUser.image,
            role: fallbackSessionUser.role,
          };
        },
      }),
    ];

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || fallbackSessionUser.id;
        // @ts-ignore
        session.user.role = token.role || fallbackSessionUser.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};