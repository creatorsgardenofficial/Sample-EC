import Link from "next/link";
import { PageContainer, SiteHeader } from "@/components/layout";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <PageContainer className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">ページが見つかりません</h1>
        <p className="mt-3 text-slate-600">指定された商品またはページは存在しません。</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          商品一覧へ戻る
        </Link>
      </PageContainer>
    </div>
  );
}
