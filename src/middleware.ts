import { authConfig } from "@/auth.config";
import { loginUrlForPath } from "@/lib/login";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

function normalizePathname(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.slice(0, -1);
  }
  return collapsed || "/";
}

const PUBLIC_PREFIXES = ["/login", "/api/auth"] as const;

function isRegistrationPath(pathname: string): boolean {
  return (
    pathname.startsWith("/register") || pathname.startsWith("/admin/users/new")
  );
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isShopPath(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/products");
}

function isProductReadApi(pathname: string): boolean {
  if (pathname === "/api/products") return true;
  if (/^\/api\/products\/[^/]+$/.test(pathname)) return true;
  if (/^\/api\/products\/[^/]+\/media\/[^/]+$/.test(pathname)) return true;
  return false;
}

export default auth((req) => {
  const url = req.nextUrl.clone();
  const normalizedPath = normalizePathname(url.pathname);

  if (normalizedPath !== url.pathname) {
    url.pathname = normalizedPath;
    return NextResponse.redirect(url);
  }

  const pathname = normalizedPath;
  const session = req.auth;
  const role = session?.user?.role;

  if (isRegistrationPath(pathname)) {
    const loginUrl = new URL(loginUrlForPath("/"), req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL(loginUrlForPath(pathname, pathname), req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      const deniedUrl = new URL("/seller/unauthorized", req.url);
      deniedUrl.searchParams.set("from", "admin");
      return NextResponse.redirect(deniedUrl);
    }
  }

  if (
    pathname.startsWith("/seller") &&
    pathname !== "/seller/unauthorized"
  ) {
    if (!session) {
      const loginUrl = new URL(loginUrlForPath(pathname, pathname), req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "SELLER" && role !== "ADMIN") {
      const deniedUrl = new URL("/seller/unauthorized", req.url);
      return NextResponse.redirect(deniedUrl);
    }
  }

  if ((isShopPath(pathname) || isProductReadApi(pathname)) && !session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const callbackPath = `${pathname}${url.search}`;
    const loginUrl = new URL(loginUrlForPath(pathname, callbackPath), req.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
});

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    },
  ],
};
