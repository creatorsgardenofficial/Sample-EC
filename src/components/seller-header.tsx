import Link from "next/link";
import { auth } from "@/auth";
import { SellerHeaderNav } from "@/components/seller-header-nav";
import { signOutAction } from "@/lib/actions";
import { SELLER_PORTAL_NAME, SITE_NAME } from "@/lib/site";

export async function SellerHeader() {
  const session = await auth();

  return (
    <>
      <header style={{ background: "var(--amazon-navy)" }} className="text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/seller" className="text-xl font-bold tracking-tight">
              {SELLER_PORTAL_NAME}
            </Link>
            <span className="hidden text-xs text-gray-400 sm:inline">
              {SITE_NAME} 出品者向け
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {session ? (
              <>
                <span className="hidden text-gray-300 sm:inline">
                  {session.user.name} さん
                </span>
                {session.user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white"
                  >
                    管理画面
                  </Link>
                ) : null}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : null}
            <Link
              href="/"
              className="amazon-btn-primary px-3 py-1.5 text-xs font-medium text-[#0f1111]"
            >
              ショップを見る
            </Link>
          </div>
        </div>
      </header>

      <SellerHeaderNav />
    </>
  );
}
