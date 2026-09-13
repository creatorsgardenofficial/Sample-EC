import type { Role } from "@prisma/client";

export type LoginRole = Extract<Role, "USER" | "SELLER" | "ADMIN">;

export const LOGIN_PATHS: Record<LoginRole, string> = {
  USER: "/login",
  SELLER: "/login/seller",
  ADMIN: "/login/admin",
};

export const LOGIN_TITLES: Record<LoginRole, string> = {
  USER: "一般ユーザーログイン",
  SELLER: "出品者ログイン",
  ADMIN: "管理者ログイン",
};

export function loginPathForRole(role: LoginRole): string {
  return LOGIN_PATHS[role];
}

export function loginUrlForPath(pathname: string, callbackUrl?: string): string {
  let role: LoginRole = "USER";

  if (pathname.startsWith("/admin")) {
    role = "ADMIN";
  } else if (
    pathname.startsWith("/seller") &&
    pathname !== "/seller/unauthorized"
  ) {
    role = "SELLER";
  }

  const base = LOGIN_PATHS[role];
  if (!callbackUrl) return base;

  return `${base}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function loginRoleForPath(pathname: string): LoginRole | null {
  if (pathname === "/login/admin") return "ADMIN";
  if (pathname === "/login/seller") return "SELLER";
  if (pathname === "/login") return "USER";
  return null;
}

export function isLoginRole(value: string): value is LoginRole {
  return value === "USER" || value === "SELLER" || value === "ADMIN";
}

export function defaultRedirectForRole(role: LoginRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";
  return "/";
}
