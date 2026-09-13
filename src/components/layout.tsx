import Link from "next/link";
import { auth } from "@/auth";
import { SearchForm } from "@/components/product";
import { signOutAction } from "@/lib/actions";
import { SITE_NAME } from "@/lib/site";

function SiteLogo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="amazon-logo amazon-smile inline-block shrink-0">
      <span
        className={`text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-[#131921]"}`}
      >
        {SITE_NAME}
      </span>
    </Link>
  );
}

export async function SiteHeader() {
  const session = await auth();

  return (
    <>
      <header style={{ background: "var(--amazon-navy)" }} className="text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2">
          <SiteLogo dark />

          <Link
            href="/"
            className="hidden shrink-0 rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white lg:block"
          >
            <span className="block text-[11px] text-[#ccc]">お届け先</span>
            <span className="text-sm font-bold">日本</span>
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <SearchForm variant="header" />
          </div>

          <nav className="ml-auto flex items-center gap-1 text-xs sm:text-sm">
            {session ? (
              <>
                <div className="hidden rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white sm:block">
                  <p className="text-[11px] text-[#ccc]">こんにちは</p>
                  <p className="font-bold">{session.user.name} さん</p>
                </div>
                <Link
                  href="/products"
                  className="hidden rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white md:block"
                >
                  <span className="block text-[11px] text-[#ccc]">返品もこちら</span>
                  <span className="font-bold">注文履歴</span>
                </Link>
                {session.user.role === "ADMIN" ? (
                  <Link href="/admin" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white">
                    管理画面
                  </Link>
                ) : null}
                {(session.user.role === "SELLER" || session.user.role === "ADMIN") ? (
                  <Link href="/seller" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white">
                    出品者ページ
                  </Link>
                ) : null}
                <Link
                  href="/products"
                  className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white"
                >
                  <span className="block text-[11px] text-[#ccc]">カートを</span>
                  <span className="font-bold">見る</span>
                </Link>
                <form action={signOutAction}>
                  <button type="submit" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white">
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white">
                  <span className="block text-[11px] text-[#ccc]">こんにちは、ログイン</span>
                  <span className="font-bold">アカウント＆リスト</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mx-auto max-w-[1500px] px-4 pb-2 md:hidden">
          <SearchForm variant="header" />
        </div>
      </header>

      <nav
        style={{ background: "var(--amazon-navy-light)" }}
        className="text-sm text-white"
      >
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 overflow-x-auto px-4 py-2">
          <Link href="/products" className="flex items-center gap-1 whitespace-nowrap font-bold hover:underline">
            ☰ すべて
          </Link>
          <Link href="/" className="whitespace-nowrap hover:underline">
            今日の Deals
          </Link>
          <Link href="/products" className="whitespace-nowrap hover:underline">
            すべての商品
          </Link>
          <Link href="/products?q=イヤホン" className="whitespace-nowrap hover:underline">
            イヤホン
          </Link>
          <Link href="/products?q=充電" className="whitespace-nowrap hover:underline">
            充電器
          </Link>
          <Link href="/products?q=PC" className="whitespace-nowrap hover:underline">
            PCアクセサリ
          </Link>
          <Link href="/products" className="whitespace-nowrap hover:underline">
            Prime
          </Link>
        </div>
      </nav>
    </>
  );
}

export async function AdminHeader() {
  const session = await auth();

  return (
    <header style={{ background: "#232f3e" }} className="border-b border-[#3a4553] text-white">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold">
            {SITE_NAME} 管理コンソール
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/users" className="hover:underline">
              ユーザー管理
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {session ? <span>{session.user.name}</span> : null}
          <Link href="/" className="hover:underline">
            ショップへ
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PageContainer({
  children,
  className = "",
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <main
      className={`mx-auto px-4 py-6 ${wide ? "max-w-[1500px]" : "max-w-6xl"} ${className}`}
    >
      {children}
    </main>
  );
}

export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold text-[#0f1111]">{title}</h1>
      {description ? (
        <p className="mt-1 text-sm text-[#565959]">{description}</p>
      ) : null}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-[#ddd] bg-[#232f3e] py-8 text-sm text-gray-300">
      <PageContainer wide>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>© {SITE_NAME}</p>
          <Link href="/login/seller" className="text-[#febd69] hover:underline">
            出品者の方はこちら
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}

export function AuthCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="mb-6 text-center">
          <SiteLogo href="/" />
        </div>
        <div className="amazon-card p-6">
          <h1 className="mb-4 text-xl font-normal">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
