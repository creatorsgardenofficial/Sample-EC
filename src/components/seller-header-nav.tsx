"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function SellerNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/seller" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded px-3 py-1.5 text-sm transition ${
        active
          ? "bg-[#37475a] font-semibold text-white"
          : "text-gray-200 hover:bg-[#37475a] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function SellerHeaderNav() {
  return (
    <nav
      style={{ background: "var(--amazon-navy-light)" }}
      className="border-b border-[#3a4553] text-white"
    >
      <div className="mx-auto flex max-w-[1500px] items-center gap-2 overflow-x-auto px-4 py-2">
        <SellerNavLink href="/seller">ダッシュボード</SellerNavLink>
        <SellerNavLink href="/seller/products/new">商品を出品</SellerNavLink>
        <SellerNavLink href="/seller/products">出品商品一覧</SellerNavLink>
      </div>
    </nav>
  );
}
