import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions";
import { SELLER_PORTAL_NAME, SITE_NAME } from "@/lib/site";

export default async function SellerUnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await auth();
  const { from } = await searchParams;
  const isAdminAttempt = from === "admin";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0f1111]">
          {isAdminAttempt ? "管理者専用ページです" : "出品者専用ページです"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#565959]">
          {session ? (
            <>
              現在 <strong>{session.user.email}</strong>（
              {session.user.role === "USER" ? "一般ユーザー" : session.user.role}
              ）でログイン中です。
              <br />
              {isAdminAttempt
                ? "管理者アカウントでログインし直してください。"
                : `${SELLER_PORTAL_NAME} を利用するには、出品者アカウントでログインしてください。`}
            </>
          ) : (
            "出品者アカウントでログインしてください。"
          )}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          {session ? (
            <form action={signOutAction}>
              <input type="hidden" name="redirectTo" value="/login/seller" />
              <button
                type="submit"
                className="amazon-btn-primary px-6 py-2 text-sm font-medium text-[#0f1111]"
              >
                ログアウトして出品者ログインへ
              </button>
            </form>
          ) : (
            <Link
              href="/login/seller"
              className="amazon-btn-primary px-6 py-2 text-sm font-medium text-[#0f1111]"
            >
              出品者ログイン
            </Link>
          )}
          <Link href="/" className="text-sm text-[#007185] hover:underline">
            {SITE_NAME} トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
