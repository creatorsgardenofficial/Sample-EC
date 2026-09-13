import type { NextAuthConfig } from "next-auth";

type AuthRole = "ADMIN" | "SELLER" | "USER";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as AuthRole;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AuthRole;
        session.user.email = (token.email as string) ?? session.user.email ?? "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
