import { loginUrlForPath } from "@/lib/login";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

type TokenRole = "ADMIN" | "SELLER" | "USER";

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

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const normalizedPath = normalizePathname(url.pathname);

  if (normalizedPath !== url.pathname) {
    url.pathname = normalizedPath;
    return NextResponse.redirect(url);
  }

  const pathname = normalizedPath;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const isLoggedIn = Boolean(token?.role);
  const role = token?.role as TokenRole | undefined;

  if (isRegistrationPath(pathname)) {
    const loginUrl = new URL(loginUrlForPath("/"), request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL(loginUrlForPath(pathname, pathname), request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      const deniedUrl = new URL("/seller/unauthorized", request.url);
      deniedUrl.searchParams.set("from", "admin");
      return NextResponse.redirect(deniedUrl);
    }
  }

  if (
    pathname.startsWith("/seller") &&
    pathname !== "/seller/unauthorized"
  ) {
    if (!isLoggedIn) {
      const loginUrl = new URL(loginUrlForPath(pathname, pathname), request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "SELLER" && role !== "ADMIN") {
      const deniedUrl = new URL("/seller/unauthorized", request.url);
      return NextResponse.redirect(deniedUrl);
    }
  }

  if ((isShopPath(pathname) || isProductReadApi(pathname)) && !isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const callbackPath = `${pathname}${url.search}`;
    const loginUrl = new URL(loginUrlForPath(pathname, callbackPath), request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    },
  ],
};
