import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export type AppSession = Session & {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
};

export function isAppSession(session: Session | null): session is AppSession {
  return Boolean(
    session?.user &&
      "id" in session.user &&
      "role" in session.user &&
      typeof session.user.id === "string" &&
      typeof session.user.role === "string"
  );
}

export function hasRole(session: Session | null, roles: Role[]): boolean {
  if (!isAppSession(session)) return false;
  return roles.includes(session.user.role);
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "管理者",
  SELLER: "出品者",
  USER: "一般ユーザー",
};
