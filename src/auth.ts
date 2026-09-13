import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/db";
import { isLoginRole } from "@/lib/login";
import { verifyPassword } from "@/lib/password";
import type { Role } from "@prisma/client";

const authSecret = resolveAuthSecret();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  ...(authSecret ? { secret: authSecret } : {}),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginRole: { label: "Login Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          const email = String(credentials?.email ?? "")
            .trim()
            .toLowerCase();
          const password = String(credentials?.password ?? "");
          const loginRole = String(credentials?.loginRole ?? "");

          if (!email || !password || !isLoginRole(loginRole)) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.isActive) return null;

          const valid = await verifyPassword(password, user.passwordHash);
          if (!valid) return null;

          if (user.role !== loginRole) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],
});
