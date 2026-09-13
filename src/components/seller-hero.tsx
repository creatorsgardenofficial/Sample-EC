import Link from "next/link";
import { SELLER_PORTAL_NAME, SITE_NAME } from "@/lib/site";

export function SellerHero() {
  return (
    <section className="border-b border-[#3a4553] bg-[#232f3e] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#febd69]">
          {SELLER_PORTAL_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-bold">出品者ダッシュボード</h1>
        <p className="mt-3 max-w-2xl text-gray-300">
          商品画像・価格・動画・詳細説明を登録して、{SITE_NAME} ショップに公開できます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/seller/products/new"
            className="amazon-btn-primary px-5 py-3 text-sm font-medium text-[#0f1111]"
          >
            新規出品
          </Link>
          <Link
            href="/seller/products"
            className="amazon-btn-dark px-5 py-3 text-sm text-white"
          >
            出品商品を管理
          </Link>
        </div>
      </div>
    </section>
  );
}
